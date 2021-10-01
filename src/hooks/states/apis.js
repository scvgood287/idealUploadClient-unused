import { atom } from 'jotai';

import { customAsync } from 'apis';
import {
  REQUESTTYPE_GET as GET,
  REQUESTTARGET_COLLECTIONS as COLLECTIONS,
  COLLECTION_ALL as ALL
} from 'Dictionary';

const getCollection = customAsync(GET, COLLECTIONS);

const initialCollectionsAtom = atom(async () => {
  const response = await getCollection(ALL);
  console.log("get start");
  return response.data;
});

export {
  initialCollectionsAtom
};