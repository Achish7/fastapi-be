const API_URL = "http://localhost:8000";

export const sendMessageToBot = async (message) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    return await response.json();
  } catch (error) {
    return { response: "Server error. Please try again." };
  }
};