import styled from "styled-components";

const CTAButtonStyle = styled.button`
  border: none;
  width: 100%;
  height: 39px;
  background-color: rgba( 255, 177, 86, ${({ isDelete }) => isDelete ? 0 : 1 } );
  box-shadow: 0px 4px 20px rgba(159, 159, 159, 0.25);
  margin-top: 13px;
  border-radius: 78px;
  border: 3px solid #FFB156;
  font-size: 16px;
  font-weight: 700;
  color: #000;
`;

const RadioBoxStyle = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ListStyle = styled.li`
  list-style-type: none;
`;

const ImageCardStyle = styled.button`
  width: 345px;
  height: 72px;
  background: #fff;
  filter: drop-shadow(0px 4px 20px rgba(171, 171, 171, 0.4));
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin: 8px 0 8px 0;
  padding: 8px;
  box-sizing: border-box;
  border: none;
`;

const ImageCardCardFileNameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex:3;
`;

const ImageCardFileNameStyle = styled.div`
  display: flex;
  font-size: 14px;
`;

const ImageCardPreviewStyle = styled.div`
  width: 60px;
  height: 60px;
  overflow: hidden;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  & > img {
    width: 60px;
    height: auto;
  }
`;

export {
  CTAButtonStyle,
  RadioBoxStyle,
  ListStyle,
  ImageCardStyle,
  ImageCardCardFileNameWrapper,
  ImageCardFileNameStyle,
  ImageCardPreviewStyle,
};