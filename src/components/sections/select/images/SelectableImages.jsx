import React, { memo } from 'react';
import { useAtom } from 'jotai';

import { SelectableImagesStyle } from 'styles';
import { CategorizedImages } from 'components/sections/select/images/index';
import {
  imagesAtom,
  currentLargeCategoryAtom,
  currentMediumCategoryAtom
} from 'hooks/states';
import {
  UPLOADTYPE_ERROR as ERROR,
  MEDIUMCATEGORY_NEW as NEW,
  CRITERIA_UPLOADTYPE as UPLOADTYPE,
  CRITERIA_GENDER as GENDER,
  CRITERIA_GROUP as GROUP,
  CRITERIA_MEMBER as MEMBER,
} from 'Dictionary';
import uuid from 'react-uuid';

const SelectableImages = () => {
  const [images] = useAtom(imagesAtom);
  const [currentLargeCategory] = useAtom(currentLargeCategoryAtom);
  const [currentMediumCategory] = useAtom(currentMediumCategoryAtom);

  const targetImages = images.filter(({ categorized }) => {
    const { largeCategory, mediumCategory} = categorized;
    return largeCategory === currentLargeCategory && mediumCategory === currentMediumCategory;
  }).sort((a, b) => a.fileName > b.fileName ? 1 : -1);

  let criteria = [];
  if (currentLargeCategory !== ERROR) {
    criteria.push(GROUP);
    if (currentLargeCategory === MEMBER) { criteria.push(MEMBER); };
    if (currentMediumCategory === NEW) { criteria.unshift(GENDER) };
  } else if (currentMediumCategory === GENDER) { criteria.push(UPLOADTYPE); };

  // categorizedImages
  const categorizedImages = criteria.reduce((categorizedImages, criterion) => {
    const list = categorizedImages.reduce((bundles, bundle) => {
      [...bundle.reduce((acc, image) => acc.add(image[criterion]), new Set())].forEach(item => {
        const temp = bundle.reduce((acc, image) => {
          if (image[criterion] === item) { acc.push(image); };
          return acc;
        }, []);

        bundles.push(temp);
      });
  
      return bundles;
    }, []);

    return list;
  }, [targetImages]);

  const renderThis = categorizedImages.map(items => {
    // const categories = criteria.map(criterion => <div key={uuid()}>{items[0][criterion]}</div>);

    return (
      <>
        {/* {categories} */}
        <CategorizedImages key={uuid()} categorizedImages={items}/>
      </>
    );
  });

  return (
    <SelectableImagesStyle>
      {renderThis}
    </SelectableImagesStyle>
  );
};

export default memo(SelectableImages);