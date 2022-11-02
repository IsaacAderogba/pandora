import axios from "axios";

class Actions {
  client = axios.create({
    headers: {
      "Content-Type": "application/json",
    },
    baseURL: process.env.ACTIONS_URL,
  });

  get ranking() {
    return {};
  }

  get summarization() {
    return {};
  }
}

export const actions = new Actions();
