const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
  
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
  
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
  
      // Check if response is valid JSON
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
  
      // Safely access response property
      const botText = data?.response || "Sorry, I didn't get that.";
      setMessages((prev) => [...prev, { role: "bot", text: botText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Could not reach the server. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };