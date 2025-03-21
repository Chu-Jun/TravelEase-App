// RouteOptimizationControls component
const RouteOptimizationControls = ({ dayLabel, onOptimize, loading, optimizationType, setOptimizationType, transportMode, setTransportMode }: any) => {
    return (
      <div className="flex flex-col items-start md:flex-row md:items-center space-x-2 mt-2 mb-4 max-w-full">
        <div className="font-medium text-sm">Optimize By:</div>
        <div className="flex items-center space-x-2">
          <select 
            value={optimizationType}
            onChange={(e) => setOptimizationType(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
            disabled={loading}
          >
            <option value="time">Travel Time</option>
            <option value="distance">Distance</option>
          </select>
          
        </div>
        <div className="font-medium text-sm">Preferred Mode:</div>
        <div className="flex items-center space-x-2">
          <select 
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
            disabled={loading}
          >
            <option value="BOTH">Both</option>
            <option value="DRIVE">Drive</option>
            <option value="TRANSIT">Public Transport</option>
          </select>
          
          <button
            onClick={() => onOptimize(dayLabel)}
            disabled={loading}
            className={`${
              loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm transition-colors`}
          >
            {loading ? 'Optimizing...' : 'Optimize Route'}
          </button>
        </div>
      </div>
    );
  };

  export default RouteOptimizationControls;