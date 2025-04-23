import { Message } from "@copilotkit/runtime-client-gql";
import { useState } from "react";

// Format the timestamp to a readable format
const formatTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch (error) {
    console.warn(`CopilotKit Debugger: Failed to format timestamp ${timestamp}`, error);
    return "";
  }
};

const MessagesDisplay = ({ messages }: { messages: Message[] }) => {
  if (!messages || messages.length === 0) {
    return <p>No messages yet.</p>;
  }

  return (
    <div className="copilotkit-debugger-messages-list">
      {messages.map((message) => {
        return <MessageDisplay key={message.id} message={message} />;
      })}
    </div>
  );
}

const MessageDisplay = ({ message }: { message: Message }) => {
  const [expanded, setExpanded] = useState(true);

  const isUser = message.isTextMessage() && message.role === "user";
  const isAssistant = message.isTextMessage() && message.role === "assistant";
  const isPending = message.status?.code === "Pending";
  const isError = message.status?.code === "Failed";
  const isActionExecution = message.type === "ActionExecutionMessage";
  const isResult = message.type === "ResultMessage";

  const classNames = ["copilotkit-debugger-message"];
  if (isUser) classNames.push("copilotkit-debugger-message-user");
  if (isAssistant) classNames.push("copilotkit-debugger-message-assistant");
  if (isError) classNames.push("copilotkit-debugger-message-error");
  if (isPending) classNames.push("copilotkit-debugger-message-pending");
  if (isActionExecution) classNames.push("copilotkit-debugger-message-action-execution");
  if (isResult) classNames.push("copilotkit-debugger-message-result");

  return (
    <div className={classNames.join(" ")} id={message.id}>
      <div
        className="copilotkit-debugger-message-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="copilotkit-debugger-message-role">
          {isUser ? "User" : "Assistant"}
        </div>
        {message.createdAt && (
          <div className="copilotkit-debugger-message-time">
            {formatTime(message.createdAt)}
          </div>
        )}
        <div className="copilotkit-debugger-message-id">
          {message.id}
        </div>
      </div>

      {expanded && (
        <>
          <div className="copilotkit-debugger-message-content">
            {message.isTextMessage() && message.content}
            {message.isActionExecutionMessage() && (
              <div className="copilotkit-debugger-message-action-execution-arguments">
                {JSON.stringify(message.arguments, null, 2)}
              </div>
            )}
            {message.isResultMessage() && (
              <div className="copilotkit-debugger-message-result-data">
                {JSON.stringify(message.result, null, 2)}
              </div>
            )}
          </div>

          <div className="copilotkit-debugger-message-meta">
            {message.type && (
              <span className="copilotkit-debugger-message-type">
                {message.type}
              </span>
            )}
            {message.status && (
              <span className={`copilotkit-debugger-message-status ${message.status.code === "Success" ? "success" : "error"}`}>
                {message.status.code}
              </span>
            )}
            {message.isActionExecutionMessage() && message.parentMessageId && (
              <button
                className="copilotkit-debugger-message-parent-message-id"
                onClick={() => message.parentMessageId && document.getElementById(message.parentMessageId)?.scrollIntoView({ behavior: "smooth" })}
              >
                Parent ID: {message.parentMessageId}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default MessagesDisplay;