import { Parameter } from "@copilotkit/shared";
import { FrontendAction } from "@copilotkit/react-core";

const ActionParameterArguments = ({ parameters }: { parameters: Parameter[] }) => {
  return (
    <span style={{ color: "#666" }}>
      {parameters.map((param, index) => (
        <span key={param.name} style={{ marginRight: index === parameters.length - 1 ? "0" : "4px" }}>
          <ActionParameterArgument parameter={param} />
          {index < parameters.length - 1 && ","}
        </span>
      ))}
    </span>
  );
}

const ActionParameterArgument = ({ parameter }: { parameter: Parameter }) => {
  const isComplex = parameter.type === "object" || parameter.type === "object[]";

  return (
    <span style={{ color: "#666" }}>
      <span style={{ fontWeight: "bold" }}>{parameter.name}:</span>
      {parameter.type}
      {isComplex && parameter.attributes && <>
        {"{"}
        <div style={{ marginLeft: "16px", display: "block" }}>
          <ActionParameterArguments parameters={parameter.attributes} />
        </div>
        {"}"}
      </>}
    </span>
  );
}

const ActionsDisplay = ({ actions }: { actions: Record<string, FrontendAction> }) => {
  if (!actions || Object.keys(actions).length === 0) {
    return <p>No actions available</p>;
  }

  return (
    <div className="copilotkit-debugger-actions-list">
      {Object.entries(actions).map(([id, actionData]) => {
        if (!actionData || typeof actionData !== "object" || !actionData.name) {
          return null;
        }

        return (
          <div key={id} className="copilotkit-debugger-action-item">
            <div className="copilotkit-debugger-action-name">
              <span style={{ fontWeight: "bold" }}>{actionData.name}</span>
              {"("}
              <ActionParameterArguments parameters={actionData.parameters || []} />
              {")"}
            </div>
            {actionData.description && (
              <div className="copilotkit-debugger-action-description">
                {actionData.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ActionsDisplay;