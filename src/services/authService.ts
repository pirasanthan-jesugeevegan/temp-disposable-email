import axios from 'axios';
import { BASE_URL } from '../utils/constant';

let token: string | null = null;

export const authenticate = async (
  email: string,
  password: string
): Promise<void> => {
  const response = await axios.post(
    `${BASE_URL}/token`,
    { address: email, password },
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }
  );
  token = response.data.token;
};

export const getToken = (): string | null => token;
