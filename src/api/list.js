export const getRecords = async (params) => {
  const res = await kintone.api(
    kintone.api.url("/k/v1/records", true),
    "GET", params);
  return res;
};

export const addRecord = async (body) => {
  return await kintone.api(kintone.api.url('/k/v1/record', true), 'POST', body);
};

export const addRecords = async (body) => {
  return await kintone.api(kintone.api.url('/k/v1/records', true), 'POST', body);
};

export const updateRecord = async (body, onSuccess) => {
  kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body, function(resp) {
    // success
    onSuccess && onSuccess(resp)
  }, function(error) {
    // error
    console.log(error);
  });
};

export const updateRecords = async (body, onSuccess) => {
  kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', body, function(resp) {
    // success
    onSuccess && onSuccess(resp)
  }, function(error) {
    // error
    console.log(error);
  });
};

export const deleteRecords = async (body, onSuccess) => {
  kintone.api(kintone.api.url('/k/v1/records', true), 'DELETE', body, function(resp) {
    // success
    onSuccess && onSuccess(resp)
  }, function(error) {
    // error
    console.log(error);
  });
};