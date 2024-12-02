import axios from "axios";
import { VITE_BACKEND_URL } from "../config";
import { User } from "../models/User";
import { AuthService } from "./AuthService";
import { handleError } from "./index";

export class UserService {
  static async getUser(): Promise<User | null> {
    if (AuthService.getToken()) {
      const user = await axios.get<User | null>(`${VITE_BACKEND_URL}/users/info`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return user.data;
    } else {
      return null;
    }
  }

  static async getUserById(userId?: number): Promise<User | null> {
    const user = await axios.get<User | null>(`${VITE_BACKEND_URL}/users/info/${userId}`);
    return user.data;
  }

  static async updateUser(updatedUser: User): Promise<User> {
    try {
      const response = await axios.put(
        `${VITE_BACKEND_URL}/users/update`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async verifyUserEmail(code: string): Promise<User> {
    try {
      const response = await axios.post(
        `${VITE_BACKEND_URL}/users/update/email/verify`,
        {
          code
        },
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async updateProfileImage(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post<User>(
      `${VITE_BACKEND_URL}/users/info/image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      }
    );

    return response.data;
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get<User[]>(`${VITE_BACKEND_URL}/users/`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async addUser(newUser: Partial<User>): Promise<User> {
    try {
      const response = await axios.post<User>(
        `${VITE_BACKEND_URL}/users/`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async updateUserById(userId: number, updatedUser: Partial<User>): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${VITE_BACKEND_URL}/users/${userId}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  static async deleteUser(userId: number): Promise<void> {
    try {
      await axios.delete(`${VITE_BACKEND_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${AuthService.getToken()}`,
        },
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }
}
