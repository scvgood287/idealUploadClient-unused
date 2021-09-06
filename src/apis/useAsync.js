import axios from 'axios';
import { useReducer, useEffect } from 'react';

import {
  API_URL,
  ACTIONTYPE_LOADING as LOADING,
  ACTIONTYPE_SUCCESS as SUCCESS,
  ACTIONTYPE_ERROR as ERROR,
} from '../Dictionary';

const reducer = (state, action) => {
  switch (action.type) {
    case LOADING:
      return {
        loading: true,
        data: null,
        error: null
      };
    case SUCCESS:
      return {
        loading: false,
        data: action.data,
        error: null
      };
    case ERROR:
      return {
        loading: false,
        data: null,
        error: action.error
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  };
};

const resData = async (reqType, url, body) => {
  const res = await axios[reqType](`${API_URL}/${url}`, body);
  return res.data;
};

const useAsync = (reqType, url, skip = false, body = {}, deps = []) => {
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    data: null,
    error: false
  });

  const fetchData = async (body = {}) => {
    dispatch({ type: LOADING });
    try {
      const data = await resData(reqType, url, body);
      dispatch({ type: SUCCESS, data });
    } catch (e) {
      dispatch({ type: ERROR, error: e });
    };
  };

  useEffect(() => {
    if (skip) return;
    fetchData(body);
    // eslint-disable-next-line
  }, deps);

  return [state, fetchData];
}

export default useAsync;