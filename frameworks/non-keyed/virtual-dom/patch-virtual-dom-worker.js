import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const diffTreesPath = join(
  "node_modules",
  "@lvce-editor",
  "virtual-dom-worker",
  "dist",
  "parts",
  "VirtualDomDiffTree",
  "DiffTrees.js",
)

const source = readFileSync(diffTreesPath, "utf8")

if (source.includes("Only navigate to this element if this node or its descendants changed.")) {
  console.log("virtual-dom-worker diff patch already applied")
  process.exit(0)
}

const optimizedDiffChildren = `const diffChildren = (oldChildren, newChildren, patches) => {
    const maxLength = Math.max(oldChildren.length, newChildren.length);
    // Track where we are: -1 means at parent, >= 0 means at child index
    let currentChildIndex = -1;
    const navigateToChild = (index) => {
        if (currentChildIndex === -1) {
            patches.push({
                type: PatchType.NavigateChild,
                index,
            });
        }
        else if (currentChildIndex !== index) {
            patches.push({
                type: PatchType.NavigateSibling,
                index,
            });
        }
        currentChildIndex = index;
    };
    const navigateToParent = () => {
        if (currentChildIndex >= 0) {
            patches.push({
                type: PatchType.NavigateParent,
            });
            currentChildIndex = -1;
        }
    };
    // Collect indices of children to remove (we'll add these patches at the end in reverse order)
    const indicesToRemove = [];
    for (let i = 0; i < maxLength; i++) {
        const oldNode = oldChildren[i];
        const newNode = newChildren[i];
        if (!oldNode && !newNode) {
            continue;
        }
        if (!oldNode) {
            // Add new node - we should be at the parent
            navigateToParent();
            // Flatten the entire subtree so renderInternal can handle it
            const flatNodes = TreeToArray.treeToArray(newNode);
            patches.push({
                type: PatchType.Add,
                nodes: flatNodes,
            });
        }
        else if (newNode) {
            // Compare nodes to see if we need any patches
            const nodePatches = CompareNodes.compareNodes(oldNode.node, newNode.node);
            // If nodePatches is null, the node types are incompatible - need to replace
            if (nodePatches === null) {
                // Navigate to this child
                navigateToChild(i);
                // Replace the entire subtree
                const flatNodes = TreeToArray.treeToArray(newNode);
                patches.push({
                    type: PatchType.Replace,
                    nodes: flatNodes,
                });
                // After replace, we're at the new element (same position)
                continue;
            }
            // Check if we need to recurse into children
            const hasChildrenToCompare = oldNode.children.length > 0 || newNode.children.length > 0;
            const childPatches = [];
            if (hasChildrenToCompare) {
                diffChildren(oldNode.children, newNode.children, childPatches);
            }
            // Only navigate to this element if this node or its descendants changed.
            if (nodePatches.length > 0 || childPatches.length > 0) {
                navigateToChild(i);
                patches.push(...nodePatches, ...childPatches);
            }
        }
        else {
            // Remove old node - collect the index for later removal
            indicesToRemove.push(i);
        }
    }
    // Navigate back to parent if we ended at a child
    navigateToParent();
    // Add remove patches in reverse order (highest index first)
    // This ensures indices remain valid as we remove
    for (let j = indicesToRemove.length - 1; j >= 0; j--) {
        patches.push({
            type: PatchType.RemoveChild,
            index: indicesToRemove[j],
        });
    }
};
`

const nextSource = source.replace(/const diffChildren = \(oldChildren, newChildren, patches\) => \{[\s\S]*?\n\};\nexport const diffTrees = /, `${optimizedDiffChildren}export const diffTrees = `)

if (nextSource === source) {
  throw new Error(`Failed to patch ${diffTreesPath}`)
}

writeFileSync(diffTreesPath, nextSource)
console.log("patched virtual-dom-worker diff navigation")
