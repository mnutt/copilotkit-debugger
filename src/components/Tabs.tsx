export const TabButton = ({ activeTab, setActiveTab, tab, children }: {
  activeTab: string,
  setActiveTab: (tab: string) => void,
  tab: string,
  children: React.ReactNode
}) => {
  return (
    <button
      className={`copilotkit-debugger-tab ${activeTab === tab ? "copilotkit-debugger-tab-active" : ""}`}
      disabled={activeTab === tab}
      onClick={(e) => {
        e.stopPropagation();
        setActiveTab(tab);
      }}
    >
      {children}
    </button>
  );
}

export const TabContent = ({ activeTab, tab, children }: {
  activeTab: string,
  tab: string,
  children: React.ReactNode
}) => {
  return (
    <div
      className={`copilotkit-debugger-tab-content ${activeTab === tab ? "copilotkit-debugger-tab-active" : ""}`}
    >
      {children}
    </div>
  );
}