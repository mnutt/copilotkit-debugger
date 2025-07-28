import { Tree, TreeNode } from "@copilotkit/react-core";

const ReadableContextDisplay = ({ contexts }: { contexts: TreeNode[] }) => {
  if (!contexts || contexts.length === 0) {
    return <p>No readable context available</p>;
  }

  return (
    <div className="copilotkit-debugger-readable-list">
      {contexts.map((contextItem: TreeNode, index: number) => {
        const { value, children, categories, id } = contextItem;

        return (
          <div key={contextItem.id || index} className="copilotkit-debugger-readable-item">
            <div className="copilotkit-debugger-readable-id">{id}</div>

            <div className="copilotkit-debugger-readable-content">
              {value}
            </div>

            {categories && categories.size > 0 && (
              <div className="copilotkit-debugger-readable-categories">
                {Array.from(categories).map((category: string) => (
                  <div key={category} className="copilotkit-debugger-readable-category">{category}</div>
                ))}
              </div>
            )}

            {children && children.length > 0 && (
              <div className="copilotkit-debugger-readable-children">
                <ReadableContextDisplay contexts={children} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ReadableContextDisplay;
