import axios from "axios";
import { fetchQuery as fquery } from "react-relay";
import store, { environment } from "../Store";
import { setSignedIn } from "../utils/UserSlice";

async function fetchGraphQL(query, variables, uploadables) {
  let formData = new FormData();
  let mutatedVariables = JSON.parse(JSON.stringify(variables));
  if (uploadables) {
    for (let [key, file] of Object.entries(uploadables)) {
      formData.append(key, file);
      mutatedVariables.input[key] = key;
    }
  }
  formData.append("query", query);
  formData.append("variables", JSON.stringify(mutatedVariables));

  try {
    const response = await axios.post(
      process.env.REACT_APP_GRAPHQL_URL,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      },
    );

    let cookieSet = false;
    document.cookie.split(";").forEach((cookie) => {
      const [key, value] = cookie.split("=");
      if (
        key.includes("_openthink_backend_web_user_remember_me") &&
        value.length > 0
      ) {
        cookieSet = true;
      }
    });

    store.dispatch(setSignedIn(cookieSet));

    return response.data;
  } catch (e) {
    console.log(e);
  }
}

export default fetchGraphQL;

export const fetchQuery = (query, variables, options) =>
  fquery(environment, query, variables, options);
