import axios from 'axios';

// Interface cho Trường đại học
export interface TruongType {
  id: number;
  ma_truong: string;
  ten_truong: string;
  dia_chi: string;
  loai_truong: string;
}

// API URL
const API_URL = '/json-server';

/**
 * Lấy danh sách tất cả các trường
 */
export const getAllSchools = async () => {
  try {
    const response = await axios.get(`${API_URL}/truong`);
    return {
      success: true,
      message: 'Lấy danh sách trường thành công',
      data: response.data as TruongType[],
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: [],
    };
  }
};

/**
 * Lấy thông tin chi tiết của một trường theo ID
 */
export const getSchoolById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/truong/${id}`);
    return {
      success: true,
      message: 'Lấy thông tin trường thành công',
      data: response.data as TruongType,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: null,
    };
  }
};

/**
 * Thêm trường mới
 */
export const addSchool = async (schoolData: Omit<TruongType, 'id'>) => {
  try {
    const response = await axios.post(`${API_URL}/truong`, schoolData);
    return {
      success: true,
      message: 'Thêm trường thành công',
      data: response.data as TruongType,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: null,
    };
  }
};

/**
 * Cập nhật thông tin trường
 */
export const updateSchool = async (id: number, schoolData: Omit<TruongType, 'id'>) => {
  try {
    const response = await axios.put(`${API_URL}/truong/${id}`, schoolData);
    return {
      success: true,
      message: 'Cập nhật thông tin trường thành công',
      data: response.data as TruongType,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: null,
    };
  }
};

/**
 * Xóa trường
 */
export const deleteSchool = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/truong/${id}`);
    return {
      success: true,
      message: 'Xóa trường thành công',
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Có lỗi xảy ra khi kết nối đến máy chủ',
      data: null,
    };
  }
}; 