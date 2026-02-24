import axios from 'axios';
import { appParams } from '@/lib/app-params';

const { appId, token } = appParams;

// Create a Skill Samurai API client using axios
const createApiClient = (options = {}) => {
  const client = axios.create({
    baseURL: options.serverUrl || '/api',
    headers: {
      'X-App-Id': appId,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });

  // Add response interceptor for error handling
  client.interceptors.response.use(
    response => response.data,
    error => {
      if (error.response) {
        const errorData = {
          status: error.response.status,
          message: error.response.data?.message || error.message,
          data: error.response.data
        };
        return Promise.reject(errorData);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Skill Samurai API interface
export const api = {
  // Auth methods
  auth: {
    me: async () => {
      const client = createApiClient();
      return await client.get('/auth/me');
    },
    login: async (credentials) => {
      const client = createApiClient();
      return await client.post('/auth/login', credentials);
    },
    logout: (redirectUrl) => {
      if (redirectUrl) {
        window.location.href = `/auth/logout?redirect=${encodeURIComponent(redirectUrl)}`;
      }
      // Remove token from storage
      localStorage.removeItem('skillsamurai_token');
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  },

  // Generic API methods
  entities: {
    get: async (entityType, id) => {
      const client = createApiClient();
      return await client.get(`/${entityType}/${id}`);
    },
    filter: async (entityType, query) => {
      const client = createApiClient();
      return await client.get(`/${entityType}`, { params: query });
    },
    find: async (entityType, query) => {
      const client = createApiClient();
      return await client.get(`/${entityType}`, { params: query });
    },
    list: async (entityType) => {
      const client = createApiClient();
      return await client.get(`/${entityType}`);
    },
    create: async (entityType, data) => {
      const client = createApiClient();
      return await client.post(`/${entityType}`, data);
    },
    update: async (entityType, id, data) => {
      const client = createApiClient();
      return await client.patch(`/${entityType}/${id}`, data);
    },
    delete: async (entityType, id) => {
      const client = createApiClient();
      return await client.delete(`/${entityType}/${id}`);
    },
    bulkCreate: async (entityType, dataArray) => {
      const client = createApiClient();
      return await client.post(`/${entityType}/bulk`, { data: dataArray });
    },
    schema: async (entityType) => {
      const client = createApiClient();
      return await client.get(`/${entityType}/schema`);
    }
  },

  // Function calls
  functions: {
    invoke: async (functionName, data) => {
      const client = createApiClient();
      return await client.post(`/functions/${functionName}`, data);
    }
  },

  // Integration methods
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const client = createApiClient({
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return await client.post('/integrations/core/upload', formData);
      },
      
      ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
        const client = createApiClient();
        return await client.post('/integrations/core/extract', {
          file_url,
          json_schema
        });
      }
    }
  }
};
