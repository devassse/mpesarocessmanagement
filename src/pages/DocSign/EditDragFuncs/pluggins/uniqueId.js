function generateUniqueId() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000000);
  const uniqueId = `${timestamp}_${randomNum}`;
  return uniqueId;
}


export default generateUniqueId;
