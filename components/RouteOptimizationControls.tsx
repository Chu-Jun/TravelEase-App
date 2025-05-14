// RouteOptimizationControls component
const RouteOptimizationControls = ({ dayLabel, onOptimize, loading, optimizationType, setOptimizationType, transportMode, setTransportMode }: any) => {
  return (
    <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:space-x-3 mb-4 w-full">
      {/* Optimize By section */}
      <div className="flex flex-wrap items-center">
        <label htmlFor="optimizeType" className="font-medium text-sm mr-2 mb-1 md:mb-0">
          Optimize By:
        </label>
        <select 
          id="optimizeType"
          value={optimizationType}
          onChange={(e) => setOptimizationType(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm w-full sm:w-auto"
          disabled={loading}
        >
          <option value="time">Travel Time</option>
          <option value="distance">Distance</option>
        </select>
      </div>
      
      {/* Preferred Mode section */}
      <div className="flex flex-wrap items-center">
        <label htmlFor="transportMode" className="font-medium text-sm mr-2 mb-1 md:mb-0">
          Preferred Mode:
        </label>
        <select 
          id="transportMode"
          value={transportMode}
          onChange={(e) => setTransportMode(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm w-full sm:w-auto"
          disabled={loading}
        >
          <option value="BOTH">Both</option>
          <option value="DRIVE">Drive</option>
          <option value="TRANSIT">Public Transport</option>
        </select>
      </div>
      
      {/* Optimize button */}
      <div className="flex items-center mt-2 md:mt-0">
        <button
          onClick={() => onOptimize(dayLabel)}
          disabled={loading}
          className={`${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm transition-colors w-full sm:w-auto`}
        >
          {loading ? 'Optimizing...' : 'Optimize Route'}
        </button>
      </div>
    </div>
  );
};

export default RouteOptimizationControls;