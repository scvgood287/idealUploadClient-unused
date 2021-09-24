import styled from 'styled-components';

const PreviewStyle = styled.div`
  width: 486px;
  height: 706px;
  margin: 0 12px 0 12px;
  border-radius: 10px;
  background: #e0e0e0;
  display: flex;
  padding: 24px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-sizing: border-box;
  box-shadow: inset 0px 4px 10px rgba(0, 0, 0, 0.15);
`;

const ImageViewerStyle = styled.div`
  width: 442px;
  height: 442px;
  margin-bottom: 24px;
  background: rgba(0,0,0,0);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 20px rgba(159, 159, 159, 0.45);
  overflow: hidden;
`;

const ImageStyle = styled.img.attrs({})`
  max-width: 442px;
  max-height: 442px;
  overflow: hidden;
`;

const ImageDetailsStyle = styled.div`
  max-width: 442px;
  height: 192px;
`;

const ImageCategoriesStyle = styled.p`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
`;

const ImageInformationStyle = styled.div`
  width: 442px;
  height: 60px;
  padding: 12px 18px 12px 18px;
  box-sizing: border-box;
  background: #FFFFFF;
  box-shadow: 0px 4px 20px rgba(159, 159, 159, 0.25);
  border-radius: 10px;
`;

export {
  PreviewStyle,
  ImageViewerStyle,
  ImageStyle,
  ImageDetailsStyle,
  ImageCategoriesStyle,
  ImageInformationStyle
};