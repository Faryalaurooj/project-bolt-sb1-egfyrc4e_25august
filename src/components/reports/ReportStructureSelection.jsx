import React from 'react';
import EditableSelect from '../common/EditableSelect';

function ReportStructureSelection({ formData, onInputChange }) {
  const territoryOptions = ['East Coast', 'West Coast', 'Midwest', 'South', 'Central'];
  const divisionOptions = ['Northeast', 'Southeast', 'Northwest', 'Southwest', 'Central'];
  const regionOptions = ['Connecticut', 'New York', 'New Jersey', 'Massachusetts', 'Rhode Island'];
  const districtOptions = ['Fairfield', 'Hartford', 'New Haven', 'Litchfield', 'Windham'];
  const officeOptions = ['Main Office', 'Branch Office', 'Remote Office', 'Satellite Office'];

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <h3 className="text-blue-600 font-semibold mb-4 border-b border-gray-200 pb-2">Structure Selection</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Territory:</label>
          <EditableSelect 
            value={formData.territory} 
            onChange={v => onInputChange('territory', v)} 
            options={territoryOptions} 
            placeholder="Territory" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Division:</label>
          <EditableSelect 
            value={formData.division} 
            onChange={v => onInputChange('division', v)} 
            options={divisionOptions} 
            placeholder="Division" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region:</label>
          <EditableSelect 
            value={formData.region} 
            onChange={v => onInputChange('region', v)} 
            options={regionOptions} 
            placeholder="Region" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District:</label>
          <EditableSelect 
            value={formData.district} 
            onChange={v => onInputChange('district', v)} 
            options={districtOptions} 
            placeholder="District" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Office:</label>
          <EditableSelect 
            value={formData.office} 
            onChange={v => onInputChange('office', v)} 
            options={officeOptions} 
            placeholder="Office" 
          />
        </div>
      </div>
    </div>
  );
}

export default ReportStructureSelection;