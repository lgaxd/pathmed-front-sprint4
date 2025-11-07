import { useApi } from '../contexts/api-context';

export function ApiSelector() {
  const { apiType, setApiType } = useApi();

  return (
    <div className="flex items-center space-x-2 mb-4 p-4 bg-white rounded-lg shadow">
      <span className="text-sm font-medium text-gray-700">API:</span>
      <select
        value={apiType}
        onChange={(e) => setApiType(e.target.value as 'java' | 'python')}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="java">Java</option>
        <option value="python">Python</option>
      </select>
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        apiType === 'java' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {apiType === 'java' ? 'Java' : 'Python'}
      </div>
    </div>
  );
}