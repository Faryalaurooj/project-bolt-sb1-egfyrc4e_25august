import React, { useState, useEffect } from 'react';
import { FiWifi, FiUser, FiSettings, FiTrash2, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { 
  registerDevice, 
  registerExtensions, 
  getDeviceDetails, 
  getExtensions, 
  deleteDevice, 
  getDeviceStatus,
  isDeviceRegistered 
} from '../../services/webrtcService';
import { useToast } from '../../hooks/useToast';

function DeviceManagement() {
  const { showSuccess, showError, showWarning } = useToast();
  
  const [deviceStatus, setDeviceStatus] = useState(null);
  const [deviceDetails, setDeviceDetails] = useState(null);
  const [extensions, setExtensions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Load device status on component mount
  useEffect(() => {
    loadDeviceStatus();
  }, []);

  const loadDeviceStatus = async () => {
    try {
      const status = getDeviceStatus();
      setDeviceStatus(status);
      
      if (status.isRegistered) {
        await loadDeviceDetails();
        await loadExtensions();
      }
    } catch (error) {
      console.error('❌ Failed to load device status:', error);
    }
  };

  const loadDeviceDetails = async () => {
    try {
      const result = await getDeviceDetails();
      if (result.success) {
        setDeviceDetails(result.device);
      }
    } catch (error) {
      console.error('❌ Failed to load device details:', error);
    }
  };

  const loadExtensions = async () => {
    try {
      const result = await getExtensions();
      if (result.success) {
        setExtensions(result.extensions);
      }
    } catch (error) {
      console.error('❌ Failed to load extensions:', error);
    }
  };

  const handleRegisterDevice = async () => {
    setIsRegistering(true);
    try {
      const result = await registerDevice();
      if (result.success) {
        showSuccess('Device registered successfully!');
        setDeviceDetails(result.device);
        
        // Register default extension
        const extensionResult = await registerExtensions(
          '0149be93-9b2d-9ac4-5712-000100420005', // Organization ID
          ['223'], // Extension number
          '6141815170848815365' // Impersonatee user key
        );
        
        if (extensionResult.success) {
          showSuccess(`${extensionResult.extensions.length} extensions registered!`);
          setExtensions(extensionResult.extensions);
        } else {
          showWarning(`Device registered but extension registration failed: ${extensionResult.error}`);
        }
        
        await loadDeviceStatus();
      } else {
        showError(`Device registration failed: ${result.error}`);
      }
    } catch (error) {
      showError(`Device registration failed: ${error.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!window.confirm('Are you sure you want to delete this device and all its extensions?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteDevice();
      if (result.success) {
        showSuccess('Device deleted successfully!');
        setDeviceDetails(null);
        setExtensions([]);
        await loadDeviceStatus();
      } else {
        showError(`Device deletion failed: ${result.error}`);
      }
    } catch (error) {
      showError(`Device deletion failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await loadDeviceStatus();
      showSuccess('Device status refreshed!');
    } catch (error) {
      showError(`Refresh failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FiWifi className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Device Management</h3>
            <p className="text-sm text-gray-500">Manage WebRTC device and extensions</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Device Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${deviceStatus?.isRegistered ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="font-medium text-gray-900">
                {deviceStatus?.isRegistered ? 'Device Registered' : 'Device Not Registered'}
              </p>
              <p className="text-sm text-gray-500">
                {deviceStatus?.isRegistered 
                  ? `Device ID: ${deviceStatus.deviceId}` 
                  : 'No device registered for WebRTC calls'
                }
              </p>
            </div>
          </div>
          
          {deviceStatus?.isRegistered ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600 font-medium">
                <FiCheck className="w-4 h-4 inline mr-1" />
                Active
              </span>
            </div>
          ) : (
            <button
              onClick={handleRegisterDevice}
              disabled={isRegistering}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isRegistering ? (
                <>
                  <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <FiWifi className="w-4 h-4 mr-2" />
                  Register Device
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Device Details */}
      {deviceStatus?.isRegistered && deviceDetails && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Device Information</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Device ID:</span>
              <span className="text-sm font-mono text-gray-900">{deviceDetails.deviceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Platform:</span>
              <span className="text-sm text-gray-900">{deviceDetails.clientInformation?.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">App Version:</span>
              <span className="text-sm text-gray-900">{deviceDetails.clientInformation?.appVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm text-gray-900">
                {new Date(deviceDetails.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Active:</span>
              <span className="text-sm text-gray-900">
                {new Date(deviceDetails.lastActive).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Extensions */}
      {deviceStatus?.isRegistered && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-gray-900">Extensions</h4>
            <span className="text-sm text-gray-500">
              {extensions.length} extension{extensions.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {extensions.length > 0 ? (
            <div className="space-y-2">
              {extensions.map((ext, index) => (
                <div key={ext.extensionId || index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Extension {ext.number}</p>
                        <p className="text-xs text-gray-500">
                          Organization: {ext.organizationId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                        {ext.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiUser className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No extensions registered</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {deviceStatus?.isRegistered && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Device is ready for WebRTC calls
          </div>
          <button
            onClick={handleDeleteDevice}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            Delete Device
          </button>
        </div>
      )}
    </div>
  );
}

export default DeviceManagement;
