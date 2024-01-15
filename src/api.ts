import axios from "axios";

const HOST = "http://skyrich3.iptime.org:8003/users/coding";

const getUser = async () => {
  const { data } = await axios.get(HOST);

  return data.join(",");
};

const createUser = async (user: string) => {
  const { data } = await axios.post(HOST, {
    user,
  });

  return data.join(",");
};

const deleteUser = async (user: string) => {
  const { data } = await axios.request({
    method: "delete",
    url: HOST,
    data: {
      user,
    },
  });

  return data.join(",");
};

export { getUser, createUser, deleteUser };
