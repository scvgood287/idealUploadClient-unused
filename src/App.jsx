import React, { memo, Suspense } from 'react';

import { Uploader } from './components';

const App = () => {

  return (
    <Suspense fallback="Loading...">
      <Uploader />
    </Suspense>
  );
};

export default memo(App);