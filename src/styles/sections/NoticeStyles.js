import styled from 'styled-components';

const NoticeStyle = styled.div`
  width: 376px;
  height: 706px;
  margin: 0 12px 0 12px;
  border-radius: 10px;
  background: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NoticeWrapperStyle = styled.div`
  width: 90%;
  height: 90%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
`;

const NoticesStyle = styled.div`
  width: 100%;
`;

const SendImagesStyle = styled.div`
  width: 100%;
`;

export {
  NoticeStyle,
  NoticeWrapperStyle,
  NoticesStyle,
  SendImagesStyle
};