import styled from 'styled-components';

const SelectStyle = styled.div`
  width: 376px;
  height: 706px;
  margin: 0 12px 0 12px;
  border-radius: 10px;
`;

const ImageUploaderStyle = styled.button`
  width: 376px;
  height: 706px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LargeCategoriesStyle = styled.div`
  display: flex;
  width: 376px;
  height: 54px;
  border-radius: 30px;
  background: #ececec;
  display: flex;
  margin-top: 16px;
  margin-right: 24px;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0px 4px 10px rgba(0, 0, 0, 0.15);
`;

const LargeCategoryStyle = styled.div`
  display: flex;
  font-size: 20px;
  width: 122px;
  height: 45px;
  border-radius: 30px;
  align-items: center;
  justify-content: center;
  background: ${({ selected }) => selected ? '#fff' : 'none'};
  box-shadow: ${({ selected }) => selected ? '0px 1px 10px rgba(0, 0, 0, 0.2)' : 'none'};
  color: ${({ selected }) => selected ? 'none' : '#8c8c8c'};
`;

const MediumCategoriesStyle = styled.div`
	width: 376px; 
	height: 20px;
	margin: 11px 0 12px 0;
	display: flex;
	flex-direction: row;
`;

const MediumCategoriesRadioStyle = styled.input`
	${({ checked }) => checked}
`;

const SelectableImagesStyle = styled.div`
  width: 376px;
  height: 534px;
  background: #ececec;
  display: flex;
  border-radius: 10px;
  padding: 15px 0 16px 15px;
  box-shadow: inset 0px 4px 10px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  flex-direction: column;
  overflow: auto;
`;

export {
  SelectStyle,
  ImageUploaderStyle,
  LargeCategoriesStyle,
  LargeCategoryStyle,
  MediumCategoriesStyle,
  MediumCategoriesRadioStyle,
  SelectableImagesStyle
};