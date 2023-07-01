function removeWhitespaceAndSpecialChars(str) {
  // Xóa tất cả khoảng trắng và dấu từ chuỗi
  const cleanedStr = str.replace(/\s+|[^\w\s]/gi, '');

  return cleanedStr;
}

// Sử dụng ví dụ:
const input = 'Hào đẹp trai! This is a sample string.';
const cleanedInput = removeWhitespaceAndSpecialChars(input);

console.log(cleanedInput); // Output: HelloWorldThisisasamplestring
