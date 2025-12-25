import { useState } from "react";
import { useAuth } from "@/react-app/lib/localAuthProvider";
import Layout from "@/react-app/components/Layout";

export default function AnalyticsTest() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const createTestSession = async () => {
    try {
      setTestResult("Creating test session...");
      const response = await fetch("/api/test/create-session", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
      
      // Refresh sessions list
      await loadSessions();
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/focus-sessions", {
        credentials: "include",
      });
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics", {
        credentials: "include",
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Debug Page</h1>
        
        <div className="space-y-6">
          {/* Current User */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Current User</h2>
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {/* Create Test Session */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Create Test Session</h2>
            <button
              onClick={createTestSession}
              className="px-6 py-3 bg-[#E50914] text-white rounded-lg font-bold hover:bg-[#b8070f] transition-colors"
            >
              Create 30-Minute Test Session
            </button>
            {testResult && (
              <pre className="mt-4 bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto text-sm">
                {testResult}
              </pre>
            )}
          </div>

          {/* Load Sessions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Your Sessions</h2>
            <button
              onClick={loadSessions}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mb-4"
            >
              Load My Sessions
            </button>
            {sessions.length > 0 ? (
              <div className="space-y-2">
                <p className="font-semibold">Found {sessions.length} sessions:</p>
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto text-sm max-h-96">
                  {JSON.stringify(sessions, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No sessions loaded yet</p>
            )}
          </div>

          {/* Load Analytics */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Analytics Data</h2>
            <button
              onClick={loadAnalytics}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors mb-4"
            >
              Load Analytics
            </button>
            {analytics ? (
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-x-auto text-sm max-h-96">
                {JSON.stringify(analytics, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No analytics loaded yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
