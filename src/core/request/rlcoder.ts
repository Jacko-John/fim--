import axios from "axios";
import { RLCoderResItem } from "../../shared/apis";

export async function requestRLCoder(
  url: string,
  key: string,
  left_context: string,
) {
  let req = axios.create({
    timeout: 5000,
  });
  let res: RLCoderResItem[] = [];

  console.log("Requesting RLCoder with url:", url);
  await req
    .post(url, {
      key: key,
      left_context: left_context,
    })
    .then((response) => {
      if (response.status === 200) {
        res = response.data as RLCoderResItem[];
        console.log("RLCoder response:", res);
      } else {
        console.error("RLCoder request failed with status:", response.status);
      }
    });

  if (res.length === 0) {
    console.error("RLCoder returned no results.");
    return [];
  }
  return res;
}
