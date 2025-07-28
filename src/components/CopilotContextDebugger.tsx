import { useState } from "react";
import { FrontendAction, useCopilotContext, useCopilotMessagesContext } from "@copilotkit/react-core";
import { TabButton, TabContent } from "./Tabs";
import useSizing from "../hooks/use-sizing";
import usePositioning from "../hooks/use-positioning";

import MessagesDisplay from "./Messages";
import ActionsDisplay from "./Actions";
import ContextDisplay from "./Context";

const EXPANDED_STATE_STORAGE_KEY = "copilotkit-debugger-expanded";

function saveExpandedState(isExpanded: boolean) {
  localStorage.setItem(EXPANDED_STATE_STORAGE_KEY, isExpanded.toString());
}

function loadExpandedState(): boolean {
  return localStorage.getItem(EXPANDED_STATE_STORAGE_KEY) === "true";
}

export const CopilotContextDebugger = () => {
  const { actions, getAllContext } = useCopilotContext();
  const { messages } = useCopilotMessagesContext();

  const [isExpanded, setIsExpanded] = useState(() => loadExpandedState());
  const [activeTab, setActiveTab] = useState("messages");

  const { resizeHandleProps, resizeContainerProps } = useSizing();
  const { moveContainerProps, moveHandleProps } = usePositioning({ onHandleClick: toggle, isExpanded });

  function toggle() {
    setIsExpanded(!isExpanded);
    saveExpandedState(!isExpanded);
  }

  return (
    <div
      {...resizeContainerProps}
      {...moveContainerProps}
      className={`copilotkit-debugger-container ${isExpanded ? "copilotkit-debugger-expanded" : ""}`}
      style={{ ...moveContainerProps.style, ...(isExpanded ? resizeContainerProps.style : {}) }}
    >
      <div className="copilotkit-debugger-title-bar">
        <div className="copilotkit-debugger-tabs">
          <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tab="messages">
            Messages
          </TabButton>
          <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tab="actions">
            Actions
          </TabButton>
          <TabButton activeTab={activeTab} setActiveTab={setActiveTab} tab="readable">
            Readable
          </TabButton>
        </div>

        <span className="copilotkit-debugger-title-text" {...moveHandleProps}>
          CopilotKit Debugger
        </span>

        <button className="copilotkit-debugger-toggle-button" onClick={toggle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="copilotkit-debugger-content">
        <TabContent activeTab={activeTab} tab="actions">
          <ActionsDisplay actions={actions as Record<string, FrontendAction>} />
        </TabContent>

        <TabContent activeTab={activeTab} tab="readable">
          <ContextDisplay contexts={getAllContext()} />
        </TabContent>

        <TabContent activeTab={activeTab} tab="messages">
          <MessagesDisplay messages={messages} />
        </TabContent>
      </div>

      <div className="copilotkit-debugger-resize-handle" {...resizeHandleProps} />
    </div>
  );
};
