import axios from 'axios';
import { useReducer, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/ideals'

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return {
        loading: true,
        data: null,
        error: null
      };
    case 'SUCCESS':
      return {
        loading: false,
        data: action.data,
        error: null
      };
    case 'ERROR':
      return {
        loading: false,
        data: null,
        error: action.error
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

const resData = async (reqType, url, body) => {
  let res;
  const reqUrl = `${API_URL}/${url}`
  switch (reqType) {
    case 'Get':
      res = await axios.get(reqUrl);
      return res.data;
    case 'Post':
      res = await axios.post(reqUrl, body);
      return res.data;
    default: throw new Error(`Unhandled request type: ${reqType}`);
  }
}

const useAsync = (reqType, url, skip = false, body = {}) => {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    data: null,
    error: false
  });

  const fetchData = async (body = {}) => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await resData(reqType, url, body);
      dispatch({ type: 'SUCCESS', data });
    } catch (e) {
      dispatch({ type: 'ERROR', error: e });
    }
  };

  useEffect(() => {
    if (skip) return;
    fetchData(body);
    // eslint 설정을 다음 줄에서만 비활성화
    // eslint-disable-next-line
  }, []);

  return [state, fetchData];
}

export default useAsync;