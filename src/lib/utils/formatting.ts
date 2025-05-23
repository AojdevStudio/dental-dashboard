export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 }).format(
    value
  );
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = `${phoneNumber}`.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phoneNumber;
}

export function formatAddress(address: string): string {
  return address.replace(/,/g, "\n");
}

export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString();
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString();
}

export function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No";
}

export function formatArray(array: unknown[]): string {
  return array.join(", ");
}

export function formatObject(obj: object): string {
  return JSON.stringify(obj, null, 2);
}

export function formatNull(): string {
  return "N/A";
}

export function formatUndefined(): string {
  return "N/A";
}

export function formatError(error: Error): string {
  return error.message;
}

export function formatFunction(func: (...args: unknown[]) => unknown): string {
  return func.toString();
}

export function formatSymbol(symbol: symbol): string {
  return symbol.toString();
}

export function formatBigInt(bigInt: bigint): string {
  return bigInt.toString();
}

export function formatNaN(): string {
  return "NaN";
}

export function formatInfinity(): string {
  return "Infinity";
}

export function formatNegativeInfinity(): string {
  return "-Infinity";
}

export function formatZero(): string {
  return "0";
}

export function formatEmptyString(): string {
  return "";
}

export function formatWhitespace(): string {
  return " ";
}

export function formatNewline(): string {
  return "\n";
}

export function formatTab(): string {
  return "\t";
}

export function formatCarriageReturn(): string {
  return "\r";
}

export function formatVerticalTab(): string {
  return "\v";
}

export function formatFormFeed(): string {
  return "\f";
}

export function formatBackspace(): string {
  return "\b";
}

export function formatAlert(): string {
  return "a";
}

export function formatEscape(): string {
  return "e";
}

export function formatUnicode(unicode: string): string {
  return unicode;
}

export function formatHex(hex: string): string {
  return hex;
}

export function formatOctal(octal: string): string {
  return octal;
}

export function formatBinary(binary: string): string {
  return binary;
}

export function formatScientificNotation(scientificNotation: string): string {
  return scientificNotation;
}

export function formatExponentialNotation(exponentialNotation: string): string {
  return exponentialNotation;
}

export function formatFixedPoint(fixedPoint: string): string {
  return fixedPoint;
}

export function formatFloatingPoint(floatingPoint: string): string {
  return floatingPoint;
}

export function formatDecimal(decimal: string): string {
  return decimal;
}

export function formatHexadecimal(hexadecimal: string): string {
  return hexadecimal;
}

export function formatOctalNumber(octalNumber: string): string {
  return octalNumber;
}

export function formatBinaryNumber(binaryNumber: string): string {
  return binaryNumber;
}

export function formatScientificNumber(scientificNumber: string): string {
  return scientificNumber;
}

export function formatExponentialNumber(exponentialNumber: string): string {
  return exponentialNumber;
}

export function formatFixedNumber(fixedNumber: string): string {
  return fixedNumber;
}

export function formatFloatingNumber(floatingNumber: string): string {
  return floatingNumber;
}

export function formatDecimalNumber(decimalNumber: string): string {
  return decimalNumber;
}

export function formatHexadecimalNumber(hexadecimalNumber: string): string {
  return hexadecimalNumber;
}

export function formatOctalInteger(octalInteger: string): string {
  return octalInteger;
}

export function formatBinaryInteger(binaryInteger: string): string {
  return binaryInteger;
}

export function formatScientificInteger(scientificInteger: string): string {
  return scientificInteger;
}

export function formatExponentialInteger(exponentialInteger: string): string {
  return exponentialInteger;
}

export function formatFixedInteger(fixedInteger: string): string {
  return fixedInteger;
}

export function formatFloatingInteger(floatingInteger: string): string {
  return floatingInteger;
}

export function formatDecimalInteger(decimalInteger: string): string {
  return decimalInteger;
}

export function formatHexadecimalInteger(hexadecimalInteger: string): string {
  return hexadecimalInteger;
}

export function formatOctalFloat(octalFloat: string): string {
  return octalFloat;
}

export function formatBinaryFloat(binaryFloat: string): string {
  return binaryFloat;
}

export function formatScientificFloat(scientificFloat: string): string {
  return scientificFloat;
}

export function formatExponentialFloat(exponentialFloat: string): string {
  return exponentialFloat;
}

export function formatFixedFloat(fixedFloat: string): string {
  return fixedFloat;
}

export function formatFloatingFloat(floatingFloat: string): string {
  return floatingFloat;
}

export function formatDecimalFloat(decimalFloat: string): string {
  return decimalFloat;
}

export function formatHexadecimalFloat(hexadecimalFloat: string): string {
  return hexadecimalFloat;
}

export function formatOctalDouble(octalDouble: string): string {
  return octalDouble;
}

export function formatBinaryDouble(binaryDouble: string): string {
  return binaryDouble;
}

export function formatScientificDouble(scientificDouble: string): string {
  return scientificDouble;
}

export function formatExponentialDouble(exponentialDouble: string): string {
  return exponentialDouble;
}

export function formatFixedDouble(fixedDouble: string): string {
  return fixedDouble;
}

export function formatFloatingDouble(floatingDouble: string): string {
  return floatingDouble;
}

export function formatDecimalDouble(decimalDouble: string): string {
  return decimalDouble;
}

export function formatHexadecimalDouble(hexadecimalDouble: string): string {
  return hexadecimalDouble;
}

export function formatOctalLong(octalLong: string): string {
  return octalLong;
}

export function formatBinaryLong(binaryLong: string): string {
  return binaryLong;
}

export function formatScientificLong(scientificLong: string): string {
  return scientificLong;
}

export function formatExponentialLong(exponentialLong: string): string {
  return exponentialLong;
}

export function formatFixedLong(fixedLong: string): string {
  return fixedLong;
}

export function formatFloatingLong(floatingLong: string): string {
  return floatingLong;
}

export function formatDecimalLong(decimalLong: string): string {
  return decimalLong;
}

export function formatHexadecimalLong(hexadecimalLong: string): string {
  return hexadecimalLong;
}

export function formatOctalShort(octalShort: string): string {
  return octalShort;
}

export function formatBinaryShort(binaryShort: string): string {
  return binaryShort;
}

export function formatScientificShort(scientificShort: string): string {
  return scientificShort;
}

export function formatExponentialShort(exponentialShort: string): string {
  return exponentialShort;
}

export function formatFixedShort(fixedShort: string): string {
  return fixedShort;
}

export function formatFloatingShort(floatingShort: string): string {
  return floatingShort;
}

export function formatDecimalShort(decimalShort: string): string {
  return decimalShort;
}

export function formatHexadecimalShort(hexadecimalShort: string): string {
  return hexadecimalShort;
}

export function formatOctalByte(octalByte: string): string {
  return octalByte;
}

export function formatBinaryByte(binaryByte: string): string {
  return binaryByte;
}

export function formatScientificByte(scientificByte: string): string {
  return scientificByte;
}

export function formatExponentialByte(exponentialByte: string): string {
  return exponentialByte;
}

export function formatFixedByte(fixedByte: string): string {
  return fixedByte;
}

export function formatFloatingByte(floatingByte: string): string {
  return floatingByte;
}

export function formatDecimalByte(decimalByte: string): string {
  return decimalByte;
}

export function formatHexadecimalByte(hexadecimalByte: string): string {
  return hexadecimalByte;
}

export function formatOctalChar(octalChar: string): string {
  return octalChar;
}

export function formatBinaryChar(binaryChar: string): string {
  return binaryChar;
}

export function formatScientificChar(scientificChar: string): string {
  return scientificChar;
}

export function formatExponentialChar(exponentialChar: string): string {
  return exponentialChar;
}

export function formatFixedChar(fixedChar: string): string {
  return fixedChar;
}

export function formatFloatingChar(floatingChar: string): string {
  return floatingChar;
}

export function formatDecimalChar(decimalChar: string): string {
  return decimalChar;
}

export function formatHexadecimalChar(hexadecimalChar: string): string {
  return hexadecimalChar;
}

export function formatOctalString(octalString: string): string {
  return octalString;
}

export function formatBinaryString(binaryString: string): string {
  return binaryString;
}

export function formatScientificString(scientificString: string): string {
  return scientificString;
}

export function formatExponentialString(exponentialString: string): string {
  return exponentialString;
}

export function formatFixedString(fixedString: string): string {
  return fixedString;
}

export function formatFloatingString(floatingString: string): string {
  return floatingString;
}

export function formatDecimalString(decimalString: string): string {
  return decimalString;
}

export function formatHexadecimalString(hexadecimalString: string): string {
  return hexadecimalString;
}

export function formatOctalBoolean(octalBoolean: string): string {
  return octalBoolean;
}

export function formatBinaryBoolean(binaryBoolean: string): string {
  return binaryBoolean;
}

export function formatScientificBoolean(scientificBoolean: string): string {
  return scientificBoolean;
}

export function formatExponentialBoolean(exponentialBoolean: string): string {
  return exponentialBoolean;
}

export function formatFixedBoolean(fixedBoolean: string): string {
  return fixedBoolean;
}

export function formatFloatingBoolean(floatingBoolean: string): string {
  return floatingBoolean;
}

export function formatDecimalBoolean(decimalBoolean: string): string {
  return decimalBoolean;
}

export function formatHexadecimalBoolean(hexadecimalBoolean: string): string {
  return hexadecimalBoolean;
}

export function formatOctalArray(octalArray: string): string {
  return octalArray;
}

export function formatBinaryArray(binaryArray: string): string {
  return binaryArray;
}

export function formatScientificArray(scientificArray: string): string {
  return scientificArray;
}

export function formatExponentialArray(exponentialArray: string): string {
  return exponentialArray;
}

export function formatFixedArray(fixedArray: string): string {
  return fixedArray;
}

export function formatFloatingArray(floatingArray: string): string {
  return floatingArray;
}

export function formatDecimalArray(decimalArray: string): string {
  return decimalArray;
}

export function formatHexadecimalArray(hexadecimalArray: string): string {
  return hexadecimalArray;
}

export function formatOctalObject(octalObject: string): string {
  return octalObject;
}

export function formatBinaryObject(binaryObject: string): string {
  return binaryObject;
}

export function formatScientificObject(scientificObject: string): string {
  return scientificObject;
}

export function formatExponentialObject(exponentialObject: string): string {
  return exponentialObject;
}

export function formatFixedObject(fixedObject: string): string {
  return fixedObject;
}

export function formatFloatingObject(floatingObject: string): string {
  return floatingObject;
}

export function formatDecimalObject(decimalObject: string): string {
  return decimalObject;
}

export function formatHexadecimalObject(hexadecimalObject: string): string {
  return hexadecimalObject;
}

export function formatOctalFunction(octalFunction: string): string {
  return octalFunction;
}

export function formatBinaryFunction(binaryFunction: string): string {
  return binaryFunction;
}

export function formatScientificFunction(scientificFunction: string): string {
  return scientificFunction;
}

export function formatExponentialFunction(exponentialFunction: string): string {
  return exponentialFunction;
}

export function formatFixedFunction(fixedFunction: string): string {
  return fixedFunction;
}

export function formatFloatingFunction(floatingFunction: string): string {
  return floatingFunction;
}

export function formatDecimalFunction(decimalFunction: string): string {
  return decimalFunction;
}

export function formatHexadecimalFunction(hexadecimalFunction: string): string {
  return hexadecimalFunction;
}

export function formatOctalSymbol(octalSymbol: string): string {
  return octalSymbol;
}

export function formatBinarySymbol(binarySymbol: string): string {
  return binarySymbol;
}

export function formatScientificSymbol(scientificSymbol: string): string {
  return scientificSymbol;
}

export function formatExponentialSymbol(exponentialSymbol: string): string {
  return exponentialSymbol;
}

export function formatFixedSymbol(fixedSymbol: string): string {
  return fixedSymbol;
}

export function formatFloatingSymbol(floatingSymbol: string): string {
  return floatingSymbol;
}

export function formatDecimalSymbol(decimalSymbol: string): string {
  return decimalSymbol;
}

export function formatHexadecimalSymbol(hexadecimalSymbol: string): string {
  return hexadecimalSymbol;
}

export function formatOctalBigInt(octalBigInt: string): string {
  return octalBigInt;
}

export function formatBinaryBigInt(binaryBigInt: string): string {
  return binaryBigInt;
}

export function formatScientificBigInt(scientificBigInt: string): string {
  return scientificBigInt;
}

export function formatExponentialBigInt(exponentialBigInt: string): string {
  return exponentialBigInt;
}

export function formatFixedBigInt(fixedBigInt: string): string {
  return fixedBigInt;
}

export function formatFloatingBigInt(floatingBigInt: string): string {
  return floatingBigInt;
}

export function formatDecimalBigInt(decimalBigInt: string): string {
  return decimalBigInt;
}

export function formatHexadecimalBigInt(hexadecimalBigInt: string): string {
  return hexadecimalBigInt;
}

export function formatOctalNaN(octalNaN: string): string {
  return octalNaN;
}

export function formatBinaryNaN(binaryNaN: string): string {
  return binaryNaN;
}

export function formatScientificNaN(scientificNaN: string): string {
  return scientificNaN;
}

export function formatExponentialNaN(exponentialNaN: string): string {
  return exponentialNaN;
}

export function formatFixedNaN(fixedNaN: string): string {
  return fixedNaN;
}

export function formatFloatingNaN(floatingNaN: string): string {
  return floatingNaN;
}

export function formatDecimalNaN(decimalNaN: string): string {
  return decimalNaN;
}

export function formatHexadecimalNaN(hexadecimalNaN: string): string {
  return hexadecimalNaN;
}

export function formatOctalInfinity(octalInfinity: string): string {
  return octalInfinity;
}

export function formatBinaryInfinity(binaryInfinity: string): string {
  return binaryInfinity;
}

export function formatScientificInfinity(scientificInfinity: string): string {
  return scientificInfinity;
}

export function formatExponentialInfinity(exponentialInfinity: string): string {
  return exponentialInfinity;
}

export function formatFixedInfinity(fixedInfinity: string): string {
  return fixedInfinity;
}

export function formatFloatingInfinity(floatingInfinity: string): string {
  return floatingInfinity;
}

export function formatDecimalInfinity(decimalInfinity: string): string {
  return decimalInfinity;
}

export function formatHexadecimalInfinity(hexadecimalInfinity: string): string {
  return hexadecimalInfinity;
}

export function formatOctalNegativeInfinity(octalNegativeInfinity: string): string {
  return octalNegativeInfinity;
}

export function formatBinaryNegativeInfinity(binaryNegativeInfinity: string): string {
  return binaryNegativeInfinity;
}

export function formatScientificNegativeInfinity(scientificNegativeInfinity: string): string {
  return scientificNegativeInfinity;
}

export function formatExponentialNegativeInfinity(exponentialNegativeInfinity: string): string {
  return exponentialNegativeInfinity;
}

export function formatFixedNegativeInfinity(fixedNegativeInfinity: string): string {
  return fixedNegativeInfinity;
}

export function formatFloatingNegativeInfinity(floatingNegativeInfinity: string): string {
  return floatingNegativeInfinity;
}

export function formatDecimalNegativeInfinity(decimalNegativeInfinity: string): string {
  return decimalNegativeInfinity;
}

export function formatHexadecimalNegativeInfinity(hexadecimalNegativeInfinity: string): string {
  return hexadecimalNegativeInfinity;
}

export function formatOctalZero(octalZero: string): string {
  return octalZero;
}

export function formatBinaryZero(binaryZero: string): string {
  return binaryZero;
}

export function formatScientificZero(scientificZero: string): string {
  return scientificZero;
}

export function formatExponentialZero(exponentialZero: string): string {
  return exponentialZero;
}

export function formatFixedZero(fixedZero: string): string {
  return fixedZero;
}

export function formatFloatingZero(floatingZero: string): string {
  return floatingZero;
}

export function formatDecimalZero(decimalZero: string): string {
  return decimalZero;
}

export function formatHexadecimalZero(hexadecimalZero: string): string {
  return hexadecimalZero;
}

export function formatOctalEmptyString(octalEmptyString: string): string {
  return octalEmptyString;
}

export function formatBinaryEmptyString(binaryEmptyString: string): string {
  return binaryEmptyString;
}

export function formatScientificEmptyString(scientificEmptyString: string): string {
  return scientificEmptyString;
}

export function formatExponentialEmptyString(exponentialEmptyString: string): string {
  return exponentialEmptyString;
}

export function formatFixedEmptyString(fixedEmptyString: string): string {
  return fixedEmptyString;
}

export function formatFloatingEmptyString(floatingEmptyString: string): string {
  return floatingEmptyString;
}

export function formatDecimalEmptyString(decimalEmptyString: string): string {
  return decimalEmptyString;
}

export function formatHexadecimalEmptyString(hexadecimalEmptyString: string): string {
  return hexadecimalEmptyString;
}

export function formatOctalWhitespace(octalWhitespace: string): string {
  return octalWhitespace;
}

export function formatBinaryWhitespace(binaryWhitespace: string): string {
  return binaryWhitespace;
}

export function formatScientificWhitespace(scientificWhitespace: string): string {
  return scientificWhitespace;
}

export function formatExponentialWhitespace(exponentialWhitespace: string): string {
  return exponentialWhitespace;
}

export function formatFixedWhitespace(fixedWhitespace: string): string {
  return fixedWhitespace;
}

export function formatFloatingWhitespace(floatingWhitespace: string): string {
  return floatingWhitespace;
}

export function formatDecimalWhitespace(decimalWhitespace: string): string {
  return decimalWhitespace;
}

export function formatHexadecimalWhitespace(hexadecimalWhitespace: string): string {
  return hexadecimalWhitespace;
}

export function formatOctalNewline(octalNewline: string): string {
  return octalNewline;
}

export function formatBinaryNewline(binaryNewline: string): string {
  return binaryNewline;
}

export function formatScientificNewline(scientificNewline: string): string {
  return scientificNewline;
}

export function formatExponentialNewline(exponentialNewline: string): string {
  return exponentialNewline;
}

export function formatFixedNewline(fixedNewline: string): string {
  return fixedNewline;
}

export function formatFloatingNewline(floatingNewline: string): string {
  return floatingNewline;
}

export function formatDecimalNewline(decimalNewline: string): string {
  return decimalNewline;
}

export function formatHexadecimalNewline(hexadecimalNewline: string): string {
  return hexadecimalNewline;
}

export function formatOctalTab(octalTab: string): string {
  return octalTab;
}

export function formatBinaryTab(binaryTab: string): string {
  return binaryTab;
}

export function formatScientificTab(scientificTab: string): string {
  return scientificTab;
}

export function formatExponentialTab(exponentialTab: string): string {
  return exponentialTab;
}

export function formatFixedTab(fixedTab: string): string {
  return fixedTab;
}

export function formatFloatingTab(floatingTab: string): string {
  return floatingTab;
}

export function formatDecimalTab(decimalTab: string): string {
  return decimalTab;
}

export function formatHexadecimalTab(hexadecimalTab: string): string {
  return hexadecimalTab;
}

export function formatOctalCarriageReturn(octalCarriageReturn: string): string {
  return octalCarriageReturn;
}

export function formatBinaryCarriageReturn(binaryCarriageReturn: string): string {
  return binaryCarriageReturn;
}

export function formatScientificCarriageReturn(scientificCarriageReturn: string): string {
  return scientificCarriageReturn;
}

export function formatExponentialCarriageReturn(exponentialCarriageReturn: string): string {
  return exponentialCarriageReturn;
}

export function formatFixedCarriageReturn(fixedCarriageReturn: string): string {
  return fixedCarriageReturn;
}

export function formatFloatingCarriageReturn(floatingCarriageReturn: string): string {
  return floatingCarriageReturn;
}

export function formatDecimalCarriageReturn(decimalCarriageReturn: string): string {
  return decimalCarriageReturn;
}

export function formatHexadecimalCarriageReturn(hexadecimalCarriageReturn: string): string {
  return hexadecimalCarriageReturn;
}
