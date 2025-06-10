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
    // Chuyển đổi ID từ chuỗi sang số
    const schoolsWithNumberId = response.data.map((school: any) => ({
      ...school,
      id: parseInt(school.id, 10)
    }));
    
    return {
      success: true,
      message: 'Lấy danh sách trường thành công',
      data: schoolsWithNumberId as TruongType[],
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
    // Chuyển đổi ID từ chuỗi sang số
    const schoolWithNumberId = {
      ...response.data,
      id: parseInt(response.data.id, 10)
    };
    
    return {
      success: true,
      message: 'Lấy thông tin trường thành công',
      data: schoolWithNumberId as TruongType,
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
 * Tìm ID số nguyên cao nhất hiện có và tăng lên 1
 */
const getNextNumericId = async (): Promise<number> => {
  try {
    const response = await axios.get(`${API_URL}/truong`);
    const schools = response.data;
    
    // Tìm ID cao nhất hiện có
    let maxId = 0;
    schools.forEach((school: any) => {
      // Chuyển đổi ID sang số nếu có thể
      const numericId = parseInt(school.id, 10);
      if (!isNaN(numericId) && numericId > maxId) {
        maxId = numericId;
      }
    });
    
    // Trả về ID tiếp theo
    return maxId + 1;
  } catch (error) {
    console.error('Lỗi khi tạo ID tiếp theo:', error);
    // Nếu có lỗi, trả về một ID mặc định đủ lớn để tránh xung đột
    return Math.floor(Date.now() / 1000); // Timestamp hiện tại chia 1000
  }
};

/**
 * Thêm trường mới
 */
export const addSchool = async (schoolData: Omit<TruongType, 'id'>) => {
  try {
    // Tạo một ID là số nguyên
    const nextId = await getNextNumericId();
    
    // Thêm trường với ID là chuỗi (trong dấu ngoặc kép)
    const dataToSend = {
      ...schoolData,
      id: String(nextId) // Chuyển thành chuỗi để đảm bảo lưu trong dấu ngoặc kép
    };
    
    const response = await axios.post(`${API_URL}/truong`, dataToSend);
    
    // Đảm bảo ID trong kết quả trả về là số
    const schoolWithNumberId = {
      ...response.data,
      id: parseInt(response.data.id, 10)
    };
    
    return {
      success: true,
      message: 'Thêm trường thành công',
      data: schoolWithNumberId as TruongType,
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
    const response = await axios.put(`${API_URL}/truong/${id}`, {
      ...schoolData,
      id: String(id) // Chuyển ID thành chuỗi để đảm bảo lưu trong dấu ngoặc kép
    });
    
    // Đảm bảo ID trong kết quả trả về là số
    const schoolWithNumberId = {
      ...response.data,
      id: parseInt(response.data.id, 10)
    };
    
    return {
      success: true,
      message: 'Cập nhật thông tin trường thành công',
      data: schoolWithNumberId as TruongType,
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