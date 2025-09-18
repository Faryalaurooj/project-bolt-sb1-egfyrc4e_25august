// Device Management Service for Jive WebRTC API
// Handles device registration, extension management, and call setup

class DeviceService {
  constructor() {
    this.currentDevice = null;
    this.deviceId = null;
    this.extensions = [];
    this.callbackChannels = {
      incomingCallChannelId: null,
      sessionManagementChannelId: null
    };
  }

  // Generate a unique device ID
  generateDeviceId() {
    if (!this.deviceId) {
      this.deviceId = `crm-device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.deviceId;
  }

  // Generate callback channel IDs (in production, these would come from a notification service)
  generateCallbackChannels() {
    if (!this.callbackChannels.incomingCallChannelId) {
      this.callbackChannels.incomingCallChannelId = this.generateChannelId();
    }
    if (!this.callbackChannels.sessionManagementChannelId) {
      this.callbackChannels.sessionManagementChannelId = this.generateChannelId();
    }
    return this.callbackChannels;
  }

  // Generate a channel ID
  generateChannelId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Register a device with the backend
  async registerDevice() {
    try {
      const deviceId = this.generateDeviceId();
      const callbackChannels = this.generateCallbackChannels();

      const deviceData = {
        clientInformation: {
          deviceId: deviceId,
          appVersion: '1.0.0',
          platform: 'WEB',
          appId: 'CRM-WebRTC'
        },
        callbackReference: {
          incomingCallChannelId: callbackChannels.incomingCallChannelId,
          sessionManagementChannelId: callbackChannels.sessionManagementChannelId
        }
      };

      console.log('🔄 Registering device:', deviceId);

      const response = await fetch('/api/jive-webrtc/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Device registration failed: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      this.currentDevice = result.data;
      this.deviceId = deviceId;

      console.log('✅ Device registered successfully:', result.data);

      return {
        success: true,
        device: result.data,
        message: 'Device registered successfully'
      };

    } catch (error) {
      console.error('❌ Device registration failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Device registration failed'
      };
    }
  }

  // Register extensions for the device
  async registerExtensions(organizationId, extensionNumbers, impersonateeUserKey = null) {
    try {
      if (!this.deviceId) {
        throw new Error('Device not registered. Please register device first.');
      }

      const extensions = extensionNumbers.map(number => ({
        number: number.toString(),
        impersonateeUserKey: impersonateeUserKey
      }));

      const extensionData = {
        organizationId: organizationId,
        extensions: extensions
      };

      console.log('🔄 Registering extensions:', extensions.length, 'for device:', this.deviceId);

      const response = await fetch(`/api/jive-webrtc/devices/${this.deviceId}/extensions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extensionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Extension registration failed: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      this.extensions = result.data.extensions;

      console.log('✅ Extensions registered successfully:', result.data.extensions.length);

      return {
        success: true,
        extensions: result.data.extensions,
        message: `${result.data.extensions.length} extensions registered successfully`
      };

    } catch (error) {
      console.error('❌ Extension registration failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Extension registration failed'
      };
    }
  }

  // Get device details
  async getDeviceDetails() {
    try {
      if (!this.deviceId) {
        throw new Error('Device not registered');
      }

      const response = await fetch(`/api/jive-webrtc/devices/${this.deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get device details: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      this.currentDevice = result.data;

      return {
        success: true,
        device: result.data,
        message: 'Device details retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Failed to get device details:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get device details'
      };
    }
  }

  // Get extensions for the device
  async getExtensions(organizationId = null, extensionNumber = null) {
    try {
      if (!this.deviceId) {
        throw new Error('Device not registered');
      }

      let url = `/api/jive-webrtc/devices/${this.deviceId}/extensions`;
      const params = new URLSearchParams();
      
      if (organizationId) params.append('organizationId', organizationId);
      if (extensionNumber) params.append('extensionNumber', extensionNumber);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get extensions: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      this.extensions = result.data.extensions;

      return {
        success: true,
        extensions: result.data.extensions,
        message: 'Extensions retrieved successfully'
      };

    } catch (error) {
      console.error('❌ Failed to get extensions:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to get extensions'
      };
    }
  }

  // Update device information
  async updateDevice(clientInformation = null, callbackReference = null) {
    try {
      if (!this.deviceId) {
        throw new Error('Device not registered');
      }

      const updateData = {};
      if (clientInformation) updateData.clientInformation = clientInformation;
      if (callbackReference) updateData.callbackReference = callbackReference;

      if (Object.keys(updateData).length === 0) {
        throw new Error('No update data provided');
      }

      const response = await fetch(`/api/jive-webrtc/devices/${this.deviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Device update failed: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      this.currentDevice = result.data;

      console.log('✅ Device updated successfully');

      return {
        success: true,
        device: result.data,
        message: 'Device updated successfully'
      };

    } catch (error) {
      console.error('❌ Device update failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Device update failed'
      };
    }
  }

  // Delete device and all extensions
  async deleteDevice() {
    try {
      if (!this.deviceId) {
        throw new Error('Device not registered');
      }

      const response = await fetch(`/api/jive-webrtc/devices/${this.deviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Device deletion failed: ${response.status} - ${errorData.error || response.statusText}`);
      }

      console.log('✅ Device deleted successfully');

      // Clear local state
      this.currentDevice = null;
      this.deviceId = null;
      this.extensions = [];
      this.callbackChannels = {
        incomingCallChannelId: null,
        sessionManagementChannelId: null
      };

      return {
        success: true,
        message: 'Device deleted successfully'
      };

    } catch (error) {
      console.error('❌ Device deletion failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Device deletion failed'
      };
    }
  }

  // Get current device info
  getCurrentDevice() {
    return {
      device: this.currentDevice,
      deviceId: this.deviceId,
      extensions: this.extensions,
      callbackChannels: this.callbackChannels
    };
  }

  // Check if device is registered
  isDeviceRegistered() {
    return !!this.deviceId && !!this.currentDevice;
  }

  // Get device status
  getDeviceStatus() {
    return {
      isRegistered: this.isDeviceRegistered(),
      deviceId: this.deviceId,
      hasExtensions: this.extensions.length > 0,
      extensionCount: this.extensions.length,
      lastActive: this.currentDevice?.lastActive || null
    };
  }
}

// Create and export singleton instance
const deviceService = new DeviceService();

// Export individual functions
export const registerDevice = () => deviceService.registerDevice();
export const registerExtensions = (organizationId, extensionNumbers, impersonateeUserKey) => 
  deviceService.registerExtensions(organizationId, extensionNumbers, impersonateeUserKey);
export const getDeviceDetails = () => deviceService.getDeviceDetails();
export const getExtensions = (organizationId, extensionNumber) => 
  deviceService.getExtensions(organizationId, extensionNumber);
export const updateDevice = (clientInformation, callbackReference) => 
  deviceService.updateDevice(clientInformation, callbackReference);
export const deleteDevice = () => deviceService.deleteDevice();
export const getCurrentDevice = () => deviceService.getCurrentDevice();
export const isDeviceRegistered = () => deviceService.isDeviceRegistered();
export const getDeviceStatus = () => deviceService.getDeviceStatus();

export default deviceService;
