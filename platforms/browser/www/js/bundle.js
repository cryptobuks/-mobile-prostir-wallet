"use strict";

(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
			}var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
				var n = t[o][1][e];return s(n ? n : e);
			}, f, f.exports, e, t, n, r);
		}return n[o].exports;
	}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
		s(r[o]);
	}return s;
})({ 1: [function (require, module, exports) {
		//---------------------------------------------------------------------
		//
		// QR Code Generator for JavaScript
		//
		// Copyright (c) 2009 Kazuhiko Arase
		//
		// URL: http://www.d-project.com/
		//
		// Licensed under the MIT license:
		//	http://www.opensource.org/licenses/mit-license.php
		//
		// The word 'QR Code' is registered trademark of
		// DENSO WAVE INCORPORATED
		//	http://www.denso-wave.com/qrcode/faqpatent-e.html
		//
		//---------------------------------------------------------------------

		exports.qrcode = function () {

			//---------------------------------------------------------------------
			// qrcode
			//---------------------------------------------------------------------

			/**
    * qrcode
    * @param typeNumber 1 to 10
    * @param errorCorrectLevel 'L','M','Q','H'
    */
			var qrcode = function qrcode(typeNumber, errorCorrectLevel) {

				var PAD0 = 0xEC;
				var PAD1 = 0x11;

				var _typeNumber = typeNumber;
				var _errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
				var _modules = null;
				var _moduleCount = 0;
				var _dataCache = null;
				var _dataList = new Array();

				var _this = {};

				var makeImpl = function makeImpl(test, maskPattern) {

					_moduleCount = _typeNumber * 4 + 17;
					_modules = function (moduleCount) {
						var modules = new Array(moduleCount);
						for (var row = 0; row < moduleCount; row += 1) {
							modules[row] = new Array(moduleCount);
							for (var col = 0; col < moduleCount; col += 1) {
								modules[row][col] = null;
							}
						}
						return modules;
					}(_moduleCount);

					setupPositionProbePattern(0, 0);
					setupPositionProbePattern(_moduleCount - 7, 0);
					setupPositionProbePattern(0, _moduleCount - 7);
					setupPositionAdjustPattern();
					setupTimingPattern();
					setupTypeInfo(test, maskPattern);

					if (_typeNumber >= 7) {
						setupTypeNumber(test);
					}

					if (_dataCache == null) {
						_dataCache = createData(_typeNumber, _errorCorrectLevel, _dataList);
					}

					mapData(_dataCache, maskPattern);
				};

				var setupPositionProbePattern = function setupPositionProbePattern(row, col) {

					for (var r = -1; r <= 7; r += 1) {

						if (row + r <= -1 || _moduleCount <= row + r) continue;

						for (var c = -1; c <= 7; c += 1) {

							if (col + c <= -1 || _moduleCount <= col + c) continue;

							if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
								_modules[row + r][col + c] = true;
							} else {
								_modules[row + r][col + c] = false;
							}
						}
					}
				};

				var getBestMaskPattern = function getBestMaskPattern() {

					var minLostPoint = 0;
					var pattern = 0;

					for (var i = 0; i < 8; i += 1) {

						makeImpl(true, i);

						var lostPoint = QRUtil.getLostPoint(_this);

						if (i == 0 || minLostPoint > lostPoint) {
							minLostPoint = lostPoint;
							pattern = i;
						}
					}

					return pattern;
				};

				var setupTimingPattern = function setupTimingPattern() {

					for (var r = 8; r < _moduleCount - 8; r += 1) {
						if (_modules[r][6] != null) {
							continue;
						}
						_modules[r][6] = r % 2 == 0;
					}

					for (var c = 8; c < _moduleCount - 8; c += 1) {
						if (_modules[6][c] != null) {
							continue;
						}
						_modules[6][c] = c % 2 == 0;
					}
				};

				var setupPositionAdjustPattern = function setupPositionAdjustPattern() {

					var pos = QRUtil.getPatternPosition(_typeNumber);

					for (var i = 0; i < pos.length; i += 1) {

						for (var j = 0; j < pos.length; j += 1) {

							var row = pos[i];
							var col = pos[j];

							if (_modules[row][col] != null) {
								continue;
							}

							for (var r = -2; r <= 2; r += 1) {

								for (var c = -2; c <= 2; c += 1) {

									if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
										_modules[row + r][col + c] = true;
									} else {
										_modules[row + r][col + c] = false;
									}
								}
							}
						}
					}
				};

				var setupTypeNumber = function setupTypeNumber(test) {

					var bits = QRUtil.getBCHTypeNumber(_typeNumber);

					for (var i = 0; i < 18; i += 1) {
						var mod = !test && (bits >> i & 1) == 1;
						_modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
					}

					for (var i = 0; i < 18; i += 1) {
						var mod = !test && (bits >> i & 1) == 1;
						_modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
					}
				};

				var setupTypeInfo = function setupTypeInfo(test, maskPattern) {

					var data = _errorCorrectLevel << 3 | maskPattern;
					var bits = QRUtil.getBCHTypeInfo(data);

					// vertical
					for (var i = 0; i < 15; i += 1) {

						var mod = !test && (bits >> i & 1) == 1;

						if (i < 6) {
							_modules[i][8] = mod;
						} else if (i < 8) {
							_modules[i + 1][8] = mod;
						} else {
							_modules[_moduleCount - 15 + i][8] = mod;
						}
					}

					// horizontal
					for (var i = 0; i < 15; i += 1) {

						var mod = !test && (bits >> i & 1) == 1;

						if (i < 8) {
							_modules[8][_moduleCount - i - 1] = mod;
						} else if (i < 9) {
							_modules[8][15 - i - 1 + 1] = mod;
						} else {
							_modules[8][15 - i - 1] = mod;
						}
					}

					// fixed module
					_modules[_moduleCount - 8][8] = !test;
				};

				var mapData = function mapData(data, maskPattern) {

					var inc = -1;
					var row = _moduleCount - 1;
					var bitIndex = 7;
					var byteIndex = 0;
					var maskFunc = QRUtil.getMaskFunction(maskPattern);

					for (var col = _moduleCount - 1; col > 0; col -= 2) {

						if (col == 6) col -= 1;

						while (true) {

							for (var c = 0; c < 2; c += 1) {

								if (_modules[row][col - c] == null) {

									var dark = false;

									if (byteIndex < data.length) {
										dark = (data[byteIndex] >>> bitIndex & 1) == 1;
									}

									var mask = maskFunc(row, col - c);

									if (mask) {
										dark = !dark;
									}

									_modules[row][col - c] = dark;
									bitIndex -= 1;

									if (bitIndex == -1) {
										byteIndex += 1;
										bitIndex = 7;
									}
								}
							}

							row += inc;

							if (row < 0 || _moduleCount <= row) {
								row -= inc;
								inc = -inc;
								break;
							}
						}
					}
				};

				var createBytes = function createBytes(buffer, rsBlocks) {

					var offset = 0;

					var maxDcCount = 0;
					var maxEcCount = 0;

					var dcdata = new Array(rsBlocks.length);
					var ecdata = new Array(rsBlocks.length);

					for (var r = 0; r < rsBlocks.length; r += 1) {

						var dcCount = rsBlocks[r].dataCount;
						var ecCount = rsBlocks[r].totalCount - dcCount;

						maxDcCount = Math.max(maxDcCount, dcCount);
						maxEcCount = Math.max(maxEcCount, ecCount);

						dcdata[r] = new Array(dcCount);

						for (var i = 0; i < dcdata[r].length; i += 1) {
							dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
						}
						offset += dcCount;

						var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
						var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

						var modPoly = rawPoly.mod(rsPoly);
						ecdata[r] = new Array(rsPoly.getLength() - 1);
						for (var i = 0; i < ecdata[r].length; i += 1) {
							var modIndex = i + modPoly.getLength() - ecdata[r].length;
							ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
						}
					}

					var totalCodeCount = 0;
					for (var i = 0; i < rsBlocks.length; i += 1) {
						totalCodeCount += rsBlocks[i].totalCount;
					}

					var data = new Array(totalCodeCount);
					var index = 0;

					for (var i = 0; i < maxDcCount; i += 1) {
						for (var r = 0; r < rsBlocks.length; r += 1) {
							if (i < dcdata[r].length) {
								data[index] = dcdata[r][i];
								index += 1;
							}
						}
					}

					for (var i = 0; i < maxEcCount; i += 1) {
						for (var r = 0; r < rsBlocks.length; r += 1) {
							if (i < ecdata[r].length) {
								data[index] = ecdata[r][i];
								index += 1;
							}
						}
					}

					return data;
				};

				var createData = function createData(typeNumber, errorCorrectLevel, dataList) {

					var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

					var buffer = qrBitBuffer();

					for (var i = 0; i < dataList.length; i += 1) {
						var data = dataList[i];
						buffer.put(data.getMode(), 4);
						buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber));
						data.write(buffer);
					}

					// calc num max data.
					var totalDataCount = 0;
					for (var i = 0; i < rsBlocks.length; i += 1) {
						totalDataCount += rsBlocks[i].dataCount;
					}

					if (buffer.getLengthInBits() > totalDataCount * 8) {
						throw new Error('code length overflow. (' + buffer.getLengthInBits() + '>' + totalDataCount * 8 + ')');
					}

					// end code
					if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
						buffer.put(0, 4);
					}

					// padding
					while (buffer.getLengthInBits() % 8 != 0) {
						buffer.putBit(false);
					}

					// padding
					while (true) {

						if (buffer.getLengthInBits() >= totalDataCount * 8) {
							break;
						}
						buffer.put(PAD0, 8);

						if (buffer.getLengthInBits() >= totalDataCount * 8) {
							break;
						}
						buffer.put(PAD1, 8);
					}

					return createBytes(buffer, rsBlocks);
				};

				_this.addData = function (data) {
					var newData = qr8BitByte(data);
					_dataList.push(newData);
					_dataCache = null;
				};

				_this.isDark = function (row, col) {
					if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
						throw new Error(row + ',' + col);
					}
					return _modules[row][col];
				};

				_this.getModuleCount = function () {
					return _moduleCount;
				};

				_this.make = function () {
					makeImpl(false, getBestMaskPattern());
				};

				_this.createTableTag = function (cellSize, margin) {

					cellSize = cellSize || 2;
					margin = typeof margin == 'undefined' ? cellSize * 4 : margin;

					var qrHtml = '';

					qrHtml += '<table style="';
					qrHtml += ' border-width: 0px; border-style: none;';
					qrHtml += ' border-collapse: collapse;';
					qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
					qrHtml += '">';
					qrHtml += '<tbody>';

					for (var r = 0; r < _this.getModuleCount(); r += 1) {

						qrHtml += '<tr>';

						for (var c = 0; c < _this.getModuleCount(); c += 1) {
							qrHtml += '<td style="';
							qrHtml += ' border-width: 0px; border-style: none;';
							qrHtml += ' border-collapse: collapse;';
							qrHtml += ' padding: 0px; margin: 0px;';
							qrHtml += ' width: ' + cellSize + 'px;';
							qrHtml += ' height: ' + cellSize + 'px;';
							qrHtml += ' background-color: ';
							qrHtml += _this.isDark(r, c) ? '#000000' : '#ffffff';
							qrHtml += ';';
							qrHtml += '"/>';
						}

						qrHtml += '</tr>';
					}

					qrHtml += '</tbody>';
					qrHtml += '</table>';

					return qrHtml;
				};

				_this.createImgTag = function (cellSize, margin) {

					cellSize = cellSize || 2;
					margin = typeof margin == 'undefined' ? cellSize * 4 : margin;

					var size = _this.getModuleCount() * cellSize + margin * 2;
					var min = margin;
					var max = size - margin;

					return createImgTag(size, size, function (x, y) {
						if (min <= x && x < max && min <= y && y < max) {
							var c = Math.floor((x - min) / cellSize);
							var r = Math.floor((y - min) / cellSize);
							return _this.isDark(r, c) ? 0 : 1;
						} else {
							return 1;
						}
					});
				};

				return _this;
			};

			//---------------------------------------------------------------------
			// qrcode.stringToBytes
			//---------------------------------------------------------------------

			qrcode.stringToBytes = function (s) {
				var bytes = new Array();
				for (var i = 0; i < s.length; i += 1) {
					var c = s.charCodeAt(i);
					bytes.push(c & 0xff);
				}
				return bytes;
			};

			//---------------------------------------------------------------------
			// qrcode.createStringToBytes
			//---------------------------------------------------------------------

			/**
    * @param unicodeData base64 string of byte array.
    * [16bit Unicode],[16bit Bytes], ...
    * @param numChars
    */
			qrcode.createStringToBytes = function (unicodeData, numChars) {

				// create conversion map.

				var unicodeMap = function () {

					var bin = base64DecodeInputStream(unicodeData);
					var read = function read() {
						var b = bin.read();
						if (b == -1) throw new Error();
						return b;
					};

					var count = 0;
					var unicodeMap = {};
					while (true) {
						var b0 = bin.read();
						if (b0 == -1) break;
						var b1 = read();
						var b2 = read();
						var b3 = read();
						var k = String.fromCharCode(b0 << 8 | b1);
						var v = b2 << 8 | b3;
						unicodeMap[k] = v;
						count += 1;
					}
					if (count != numChars) {
						throw new Error(count + ' != ' + numChars);
					}

					return unicodeMap;
				}();

				var unknownChar = '?'.charCodeAt(0);

				return function (s) {
					var bytes = new Array();
					for (var i = 0; i < s.length; i += 1) {
						var c = s.charCodeAt(i);
						if (c < 128) {
							bytes.push(c);
						} else {
							var b = unicodeMap[s.charAt(i)];
							if (typeof b == 'number') {
								if ((b & 0xff) == b) {
									// 1byte
									bytes.push(b);
								} else {
									// 2bytes
									bytes.push(b >>> 8);
									bytes.push(b & 0xff);
								}
							} else {
								bytes.push(unknownChar);
							}
						}
					}
					return bytes;
				};
			};

			//---------------------------------------------------------------------
			// QRMode
			//---------------------------------------------------------------------

			var QRMode = {
				MODE_NUMBER: 1 << 0,
				MODE_ALPHA_NUM: 1 << 1,
				MODE_8BIT_BYTE: 1 << 2,
				MODE_KANJI: 1 << 3
			};

			//---------------------------------------------------------------------
			// QRErrorCorrectLevel
			//---------------------------------------------------------------------

			var QRErrorCorrectLevel = {
				L: 1,
				M: 0,
				Q: 3,
				H: 2
			};

			//---------------------------------------------------------------------
			// QRMaskPattern
			//---------------------------------------------------------------------

			var QRMaskPattern = {
				PATTERN000: 0,
				PATTERN001: 1,
				PATTERN010: 2,
				PATTERN011: 3,
				PATTERN100: 4,
				PATTERN101: 5,
				PATTERN110: 6,
				PATTERN111: 7
			};

			//---------------------------------------------------------------------
			// QRUtil
			//---------------------------------------------------------------------

			var QRUtil = function () {

				var PATTERN_POSITION_TABLE = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]];
				var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
				var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
				var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;

				var _this = {};

				var getBCHDigit = function getBCHDigit(data) {
					var digit = 0;
					while (data != 0) {
						digit += 1;
						data >>>= 1;
					}
					return digit;
				};

				_this.getBCHTypeInfo = function (data) {
					var d = data << 10;
					while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
						d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
					}
					return (data << 10 | d) ^ G15_MASK;
				};

				_this.getBCHTypeNumber = function (data) {
					var d = data << 12;
					while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
						d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
					}
					return data << 12 | d;
				};

				_this.getPatternPosition = function (typeNumber) {
					return PATTERN_POSITION_TABLE[typeNumber - 1];
				};

				_this.getMaskFunction = function (maskPattern) {

					switch (maskPattern) {

						case QRMaskPattern.PATTERN000:
							return function (i, j) {
								return (i + j) % 2 == 0;
							};
						case QRMaskPattern.PATTERN001:
							return function (i, j) {
								return i % 2 == 0;
							};
						case QRMaskPattern.PATTERN010:
							return function (i, j) {
								return j % 3 == 0;
							};
						case QRMaskPattern.PATTERN011:
							return function (i, j) {
								return (i + j) % 3 == 0;
							};
						case QRMaskPattern.PATTERN100:
							return function (i, j) {
								return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
							};
						case QRMaskPattern.PATTERN101:
							return function (i, j) {
								return i * j % 2 + i * j % 3 == 0;
							};
						case QRMaskPattern.PATTERN110:
							return function (i, j) {
								return (i * j % 2 + i * j % 3) % 2 == 0;
							};
						case QRMaskPattern.PATTERN111:
							return function (i, j) {
								return (i * j % 3 + (i + j) % 2) % 2 == 0;
							};

						default:
							throw new Error('bad maskPattern:' + maskPattern);
					}
				};

				_this.getErrorCorrectPolynomial = function (errorCorrectLength) {
					var a = qrPolynomial([1], 0);
					for (var i = 0; i < errorCorrectLength; i += 1) {
						a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
					}
					return a;
				};

				_this.getLengthInBits = function (mode, type) {

					if (1 <= type && type < 10) {

						// 1 - 9

						switch (mode) {
							case QRMode.MODE_NUMBER:
								return 10;
							case QRMode.MODE_ALPHA_NUM:
								return 9;
							case QRMode.MODE_8BIT_BYTE:
								return 8;
							case QRMode.MODE_KANJI:
								return 8;
							default:
								throw new Error('mode:' + mode);
						}
					} else if (type < 27) {

						// 10 - 26

						switch (mode) {
							case QRMode.MODE_NUMBER:
								return 12;
							case QRMode.MODE_ALPHA_NUM:
								return 11;
							case QRMode.MODE_8BIT_BYTE:
								return 16;
							case QRMode.MODE_KANJI:
								return 10;
							default:
								throw new Error('mode:' + mode);
						}
					} else if (type < 41) {

						// 27 - 40

						switch (mode) {
							case QRMode.MODE_NUMBER:
								return 14;
							case QRMode.MODE_ALPHA_NUM:
								return 13;
							case QRMode.MODE_8BIT_BYTE:
								return 16;
							case QRMode.MODE_KANJI:
								return 12;
							default:
								throw new Error('mode:' + mode);
						}
					} else {
						throw new Error('type:' + type);
					}
				};

				_this.getLostPoint = function (qrcode) {

					var moduleCount = qrcode.getModuleCount();

					var lostPoint = 0;

					// LEVEL1

					for (var row = 0; row < moduleCount; row += 1) {
						for (var col = 0; col < moduleCount; col += 1) {

							var sameCount = 0;
							var dark = qrcode.isDark(row, col);

							for (var r = -1; r <= 1; r += 1) {

								if (row + r < 0 || moduleCount <= row + r) {
									continue;
								}

								for (var c = -1; c <= 1; c += 1) {

									if (col + c < 0 || moduleCount <= col + c) {
										continue;
									}

									if (r == 0 && c == 0) {
										continue;
									}

									if (dark == qrcode.isDark(row + r, col + c)) {
										sameCount += 1;
									}
								}
							}

							if (sameCount > 5) {
								lostPoint += 3 + sameCount - 5;
							}
						}
					};

					// LEVEL2

					for (var row = 0; row < moduleCount - 1; row += 1) {
						for (var col = 0; col < moduleCount - 1; col += 1) {
							var count = 0;
							if (qrcode.isDark(row, col)) count += 1;
							if (qrcode.isDark(row + 1, col)) count += 1;
							if (qrcode.isDark(row, col + 1)) count += 1;
							if (qrcode.isDark(row + 1, col + 1)) count += 1;
							if (count == 0 || count == 4) {
								lostPoint += 3;
							}
						}
					}

					// LEVEL3

					for (var row = 0; row < moduleCount; row += 1) {
						for (var col = 0; col < moduleCount - 6; col += 1) {
							if (qrcode.isDark(row, col) && !qrcode.isDark(row, col + 1) && qrcode.isDark(row, col + 2) && qrcode.isDark(row, col + 3) && qrcode.isDark(row, col + 4) && !qrcode.isDark(row, col + 5) && qrcode.isDark(row, col + 6)) {
								lostPoint += 40;
							}
						}
					}

					for (var col = 0; col < moduleCount; col += 1) {
						for (var row = 0; row < moduleCount - 6; row += 1) {
							if (qrcode.isDark(row, col) && !qrcode.isDark(row + 1, col) && qrcode.isDark(row + 2, col) && qrcode.isDark(row + 3, col) && qrcode.isDark(row + 4, col) && !qrcode.isDark(row + 5, col) && qrcode.isDark(row + 6, col)) {
								lostPoint += 40;
							}
						}
					}

					// LEVEL4

					var darkCount = 0;

					for (var col = 0; col < moduleCount; col += 1) {
						for (var row = 0; row < moduleCount; row += 1) {
							if (qrcode.isDark(row, col)) {
								darkCount += 1;
							}
						}
					}

					var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
					lostPoint += ratio * 10;

					return lostPoint;
				};

				return _this;
			}();

			//---------------------------------------------------------------------
			// QRMath
			//---------------------------------------------------------------------

			var QRMath = function () {

				var EXP_TABLE = new Array(256);
				var LOG_TABLE = new Array(256);

				// initialize tables
				for (var i = 0; i < 8; i += 1) {
					EXP_TABLE[i] = 1 << i;
				}
				for (var i = 8; i < 256; i += 1) {
					EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
				}
				for (var i = 0; i < 255; i += 1) {
					LOG_TABLE[EXP_TABLE[i]] = i;
				}

				var _this = {};

				_this.glog = function (n) {

					if (n < 1) {
						throw new Error('glog(' + n + ')');
					}

					return LOG_TABLE[n];
				};

				_this.gexp = function (n) {

					while (n < 0) {
						n += 255;
					}

					while (n >= 256) {
						n -= 255;
					}

					return EXP_TABLE[n];
				};

				return _this;
			}();

			//---------------------------------------------------------------------
			// qrPolynomial
			//---------------------------------------------------------------------

			function qrPolynomial(num, shift) {

				if (typeof num.length == 'undefined') {
					throw new Error(num.length + '/' + shift);
				}

				var _num = function () {
					var offset = 0;
					while (offset < num.length && num[offset] == 0) {
						offset += 1;
					}
					var _num = new Array(num.length - offset + shift);
					for (var i = 0; i < num.length - offset; i += 1) {
						_num[i] = num[i + offset];
					}
					return _num;
				}();

				var _this = {};

				_this.get = function (index) {
					return _num[index];
				};

				_this.getLength = function () {
					return _num.length;
				};

				_this.multiply = function (e) {

					var num = new Array(_this.getLength() + e.getLength() - 1);

					for (var i = 0; i < _this.getLength(); i += 1) {
						for (var j = 0; j < e.getLength(); j += 1) {
							num[i + j] ^= QRMath.gexp(QRMath.glog(_this.get(i)) + QRMath.glog(e.get(j)));
						}
					}

					return qrPolynomial(num, 0);
				};

				_this.mod = function (e) {

					if (_this.getLength() - e.getLength() < 0) {
						return _this;
					}

					var ratio = QRMath.glog(_this.get(0)) - QRMath.glog(e.get(0));

					var num = new Array(_this.getLength());
					for (var i = 0; i < _this.getLength(); i += 1) {
						num[i] = _this.get(i);
					}

					for (var i = 0; i < e.getLength(); i += 1) {
						num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
					}

					// recursive call
					return qrPolynomial(num, 0).mod(e);
				};

				return _this;
			};

			//---------------------------------------------------------------------
			// QRRSBlock
			//---------------------------------------------------------------------

			var QRRSBlock = function () {

				var RS_BLOCK_TABLE = [

				// L
				// M
				// Q
				// H

				// 1
				[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],

				// 2
				[1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],

				// 3
				[1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],

				// 4
				[1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],

				// 5
				[1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],

				// 6
				[2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],

				// 7
				[2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],

				// 8
				[2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],

				// 9
				[2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],

				// 10
				[2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16]];

				var qrRSBlock = function qrRSBlock(totalCount, dataCount) {
					var _this = {};
					_this.totalCount = totalCount;
					_this.dataCount = dataCount;
					return _this;
				};

				var _this = {};

				var getRsBlockTable = function getRsBlockTable(typeNumber, errorCorrectLevel) {

					switch (errorCorrectLevel) {
						case QRErrorCorrectLevel.L:
							return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
						case QRErrorCorrectLevel.M:
							return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
						case QRErrorCorrectLevel.Q:
							return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
						case QRErrorCorrectLevel.H:
							return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
						default:
							return undefined;
					}
				};

				_this.getRSBlocks = function (typeNumber, errorCorrectLevel) {

					var rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);

					if (typeof rsBlock == 'undefined') {
						throw new Error('bad rs block @ typeNumber:' + typeNumber + '/errorCorrectLevel:' + errorCorrectLevel);
					}

					var length = rsBlock.length / 3;

					var list = new Array();

					for (var i = 0; i < length; i += 1) {

						var count = rsBlock[i * 3 + 0];
						var totalCount = rsBlock[i * 3 + 1];
						var dataCount = rsBlock[i * 3 + 2];

						for (var j = 0; j < count; j += 1) {
							list.push(qrRSBlock(totalCount, dataCount));
						}
					}

					return list;
				};

				return _this;
			}();

			//---------------------------------------------------------------------
			// qrBitBuffer
			//---------------------------------------------------------------------

			var qrBitBuffer = function qrBitBuffer() {

				var _buffer = new Array();
				var _length = 0;

				var _this = {};

				_this.getBuffer = function () {
					return _buffer;
				};

				_this.get = function (index) {
					var bufIndex = Math.floor(index / 8);
					return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
				};

				_this.put = function (num, length) {
					for (var i = 0; i < length; i += 1) {
						_this.putBit((num >>> length - i - 1 & 1) == 1);
					}
				};

				_this.getLengthInBits = function () {
					return _length;
				};

				_this.putBit = function (bit) {

					var bufIndex = Math.floor(_length / 8);
					if (_buffer.length <= bufIndex) {
						_buffer.push(0);
					}

					if (bit) {
						_buffer[bufIndex] |= 0x80 >>> _length % 8;
					}

					_length += 1;
				};

				return _this;
			};

			//---------------------------------------------------------------------
			// qr8BitByte
			//---------------------------------------------------------------------

			var qr8BitByte = function qr8BitByte(data) {

				var _mode = QRMode.MODE_8BIT_BYTE;
				var _data = data;
				var _bytes = qrcode.stringToBytes(data);

				var _this = {};

				_this.getMode = function () {
					return _mode;
				};

				_this.getLength = function (buffer) {
					return _bytes.length;
				};

				_this.write = function (buffer) {
					for (var i = 0; i < _bytes.length; i += 1) {
						buffer.put(_bytes[i], 8);
					}
				};

				return _this;
			};

			//=====================================================================
			// GIF Support etc.
			//

			//---------------------------------------------------------------------
			// byteArrayOutputStream
			//---------------------------------------------------------------------

			var byteArrayOutputStream = function byteArrayOutputStream() {

				var _bytes = new Array();

				var _this = {};

				_this.writeByte = function (b) {
					_bytes.push(b & 0xff);
				};

				_this.writeShort = function (i) {
					_this.writeByte(i);
					_this.writeByte(i >>> 8);
				};

				_this.writeBytes = function (b, off, len) {
					off = off || 0;
					len = len || b.length;
					for (var i = 0; i < len; i += 1) {
						_this.writeByte(b[i + off]);
					}
				};

				_this.writeString = function (s) {
					for (var i = 0; i < s.length; i += 1) {
						_this.writeByte(s.charCodeAt(i));
					}
				};

				_this.toByteArray = function () {
					return _bytes;
				};

				_this.toString = function () {
					var s = '';
					s += '[';
					for (var i = 0; i < _bytes.length; i += 1) {
						if (i > 0) {
							s += ',';
						}
						s += _bytes[i];
					}
					s += ']';
					return s;
				};

				return _this;
			};

			//---------------------------------------------------------------------
			// base64EncodeOutputStream
			//---------------------------------------------------------------------

			var base64EncodeOutputStream = function base64EncodeOutputStream() {

				var _buffer = 0;
				var _buflen = 0;
				var _length = 0;
				var _base64 = '';

				var _this = {};

				var writeEncoded = function writeEncoded(b) {
					_base64 += String.fromCharCode(encode(b & 0x3f));
				};

				var encode = function encode(n) {
					if (n < 0) {
						// error.
					} else if (n < 26) {
						return 0x41 + n;
					} else if (n < 52) {
						return 0x61 + (n - 26);
					} else if (n < 62) {
						return 0x30 + (n - 52);
					} else if (n == 62) {
						return 0x2b;
					} else if (n == 63) {
						return 0x2f;
					}
					throw new Error('n:' + n);
				};

				_this.writeByte = function (n) {

					_buffer = _buffer << 8 | n & 0xff;
					_buflen += 8;
					_length += 1;

					while (_buflen >= 6) {
						writeEncoded(_buffer >>> _buflen - 6);
						_buflen -= 6;
					}
				};

				_this.flush = function () {

					if (_buflen > 0) {
						writeEncoded(_buffer << 6 - _buflen);
						_buffer = 0;
						_buflen = 0;
					}

					if (_length % 3 != 0) {
						// padding
						var padlen = 3 - _length % 3;
						for (var i = 0; i < padlen; i += 1) {
							_base64 += '=';
						}
					}
				};

				_this.toString = function () {
					return _base64;
				};

				return _this;
			};

			//---------------------------------------------------------------------
			// base64DecodeInputStream
			//---------------------------------------------------------------------

			var base64DecodeInputStream = function base64DecodeInputStream(str) {

				var _str = str;
				var _pos = 0;
				var _buffer = 0;
				var _buflen = 0;

				var _this = {};

				_this.read = function () {

					while (_buflen < 8) {

						if (_pos >= _str.length) {
							if (_buflen == 0) {
								return -1;
							}
							throw new Error('unexpected end of file./' + _buflen);
						}

						var c = _str.charAt(_pos);
						_pos += 1;

						if (c == '=') {
							_buflen = 0;
							return -1;
						} else if (c.match(/^\s$/)) {
							// ignore if whitespace.
							continue;
						}

						_buffer = _buffer << 6 | decode(c.charCodeAt(0));
						_buflen += 6;
					}

					var n = _buffer >>> _buflen - 8 & 0xff;
					_buflen -= 8;
					return n;
				};

				var decode = function decode(c) {
					if (0x41 <= c && c <= 0x5a) {
						return c - 0x41;
					} else if (0x61 <= c && c <= 0x7a) {
						return c - 0x61 + 26;
					} else if (0x30 <= c && c <= 0x39) {
						return c - 0x30 + 52;
					} else if (c == 0x2b) {
						return 62;
					} else if (c == 0x2f) {
						return 63;
					} else {
						throw new Error('c:' + c);
					}
				};

				return _this;
			};

			//---------------------------------------------------------------------
			// gifImage (B/W)
			//---------------------------------------------------------------------

			var gifImage = function gifImage(width, height) {

				var _width = width;
				var _height = height;
				var _data = new Array(width * height);

				var _this = {};

				_this.setPixel = function (x, y, pixel) {
					_data[y * _width + x] = pixel;
				};

				_this.write = function (out) {

					//---------------------------------
					// GIF Signature

					out.writeString('GIF87a');

					//---------------------------------
					// Screen Descriptor

					out.writeShort(_width);
					out.writeShort(_height);

					out.writeByte(0x80); // 2bit
					out.writeByte(0);
					out.writeByte(0);

					//---------------------------------
					// Global Color Map

					// black
					out.writeByte(0x00);
					out.writeByte(0x00);
					out.writeByte(0x00);

					// white
					out.writeByte(0xff);
					out.writeByte(0xff);
					out.writeByte(0xff);

					//---------------------------------
					// Image Descriptor

					out.writeString(',');
					out.writeShort(0);
					out.writeShort(0);
					out.writeShort(_width);
					out.writeShort(_height);
					out.writeByte(0);

					//---------------------------------
					// Local Color Map

					//---------------------------------
					// Raster Data

					var lzwMinCodeSize = 2;
					var raster = getLZWRaster(lzwMinCodeSize);

					out.writeByte(lzwMinCodeSize);

					var offset = 0;

					while (raster.length - offset > 255) {
						out.writeByte(255);
						out.writeBytes(raster, offset, 255);
						offset += 255;
					}

					out.writeByte(raster.length - offset);
					out.writeBytes(raster, offset, raster.length - offset);
					out.writeByte(0x00);

					//---------------------------------
					// GIF Terminator
					out.writeString(';');
				};

				var bitOutputStream = function bitOutputStream(out) {

					var _out = out;
					var _bitLength = 0;
					var _bitBuffer = 0;

					var _this = {};

					_this.write = function (data, length) {

						if (data >>> length != 0) {
							throw new Error('length over');
						}

						while (_bitLength + length >= 8) {
							_out.writeByte(0xff & (data << _bitLength | _bitBuffer));
							length -= 8 - _bitLength;
							data >>>= 8 - _bitLength;
							_bitBuffer = 0;
							_bitLength = 0;
						}

						_bitBuffer = data << _bitLength | _bitBuffer;
						_bitLength = _bitLength + length;
					};

					_this.flush = function () {
						if (_bitLength > 0) {
							_out.writeByte(_bitBuffer);
						}
					};

					return _this;
				};

				var getLZWRaster = function getLZWRaster(lzwMinCodeSize) {

					var clearCode = 1 << lzwMinCodeSize;
					var endCode = (1 << lzwMinCodeSize) + 1;
					var bitLength = lzwMinCodeSize + 1;

					// Setup LZWTable
					var table = lzwTable();

					for (var i = 0; i < clearCode; i += 1) {
						table.add(String.fromCharCode(i));
					}
					table.add(String.fromCharCode(clearCode));
					table.add(String.fromCharCode(endCode));

					var byteOut = byteArrayOutputStream();
					var bitOut = bitOutputStream(byteOut);

					// clear code
					bitOut.write(clearCode, bitLength);

					var dataIndex = 0;

					var s = String.fromCharCode(_data[dataIndex]);
					dataIndex += 1;

					while (dataIndex < _data.length) {

						var c = String.fromCharCode(_data[dataIndex]);
						dataIndex += 1;

						if (table.contains(s + c)) {

							s = s + c;
						} else {

							bitOut.write(table.indexOf(s), bitLength);

							if (table.size() < 0xfff) {

								if (table.size() == 1 << bitLength) {
									bitLength += 1;
								}

								table.add(s + c);
							}

							s = c;
						}
					}

					bitOut.write(table.indexOf(s), bitLength);

					// end code
					bitOut.write(endCode, bitLength);

					bitOut.flush();

					return byteOut.toByteArray();
				};

				var lzwTable = function lzwTable() {

					var _map = {};
					var _size = 0;

					var _this = {};

					_this.add = function (key) {
						if (_this.contains(key)) {
							throw new Error('dup key:' + key);
						}
						_map[key] = _size;
						_size += 1;
					};

					_this.size = function () {
						return _size;
					};

					_this.indexOf = function (key) {
						return _map[key];
					};

					_this.contains = function (key) {
						return typeof _map[key] != 'undefined';
					};

					return _this;
				};

				return _this;
			};

			var createImgTag = function createImgTag(width, height, getPixel, alt) {

				var gif = gifImage(width, height);
				for (var y = 0; y < height; y += 1) {
					for (var x = 0; x < width; x += 1) {
						gif.setPixel(x, y, getPixel(x, y));
					}
				}

				var b = byteArrayOutputStream();
				gif.write(b);

				var base64 = base64EncodeOutputStream();
				var bytes = b.toByteArray();
				for (var i = 0; i < bytes.length; i += 1) {
					base64.writeByte(bytes[i]);
				}
				base64.flush();

				var img = '';
				img += '<img';
				img += " src=\"";
				img += 'data:image/gif;base64,';
				img += base64;
				img += '"';
				img += " width=\"";
				img += width;
				img += '"';
				img += " height=\"";
				img += height;
				img += '"';
				if (alt) {
					img += " alt=\"";
					img += alt;
					img += '"';
				}
				img += '/>';

				return img;
			};

			//---------------------------------------------------------------------
			// returns qrcode function.

			return qrcode;
		}();
	}, {}], 2: [function (require, module, exports) {
		var Footer = module.exports = {
			controller: function controller() {
				var ctrl = this;
			},

			view: function view(ctrl) {
				return { tag: "footer", attrs: { class: "footer text-right" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: ["2016 © Attic Lab."] }] }] }] };
			}
		};
	}, {}], 3: [function (require, module, exports) {
		var Auth = require('../models/Auth.js');

		var Navbar = module.exports = {

			controller: function controller() {
				var ctrl = this;

				this.visible = m.prop(false);

				this.toggleVisible = function () {
					this.visible(!this.visible());
				};
			},

			view: function view(ctrl) {
				return { tag: "header", attrs: { id: "topnav" }, children: [{ tag: "div", attrs: { class: "topbar-main" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "logo" }, children: [{ tag: "a", attrs: { href: "/", config: m.route, class: "logo" }, children: [{ tag: "i", attrs: { class: "md md-equalizer" } }, " ", { tag: "span", attrs: {}, children: ["Web Wallet"] }, " "] }] }, { tag: "div", attrs: { class: "menu-extras" }, children: [{ tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right" }, children: [{ tag: "li", attrs: { class: "dropdown" }, children: [{ tag: "a", attrs: { href: "", class: "dropdown-toggle waves-effect waves-light profile", "data-toggle": "dropdown", "aria-expanded": "true" }, children: [{ tag: "img", attrs: { src: "./assets/img/avatar-1.jpg", alt: "user-img", class: "img-circle" } }] }, { tag: "ul", attrs: { class: "dropdown-menu" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "ti-power-off m-r-5" } }, " Logout"] }] }] }] }] }, { tag: "div", attrs: { class: "menu-item" }, children: [{ tag: "a", attrs: { onclick: ctrl.toggleVisible.bind(ctrl), class: ctrl.visible() ? 'open navbar-toggle' : 'navbar-toggle' }, children: [{ tag: "div", attrs: { class: "lines" }, children: [{ tag: "span", attrs: {} }, { tag: "span", attrs: {} }, { tag: "span", attrs: {} }] }] }] }] }] }] }, { tag: "div", attrs: { class: "navbar-custom" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { id: "navigation", style: ctrl.visible() ? 'display:block;' : '' }, children: [{ tag: "ul", attrs: { class: "navigation-menu" }, children: [{ tag: "li", attrs: { class: "has-submenu active" }, children: [{ tag: "a", attrs: { href: "/", config: m.route }, children: [{ tag: "i", attrs: { class: "md md-dashboard" } }, "Dashboard"] }] }, { tag: "li", attrs: { class: "has-submenu" }, children: [{ tag: "a", attrs: { href: "/transfer", config: m.route }, children: [{ tag: "i", attrs: { class: "fa fa-money" } }, "Transfer Money"] }] }, { tag: "li", attrs: { class: "has-submenu" }, children: [{ tag: "a", attrs: { href: "/invoice", config: m.route }, children: [{ tag: "i", attrs: { class: "md md-payment" } }, "Create invoice"] }] }, { tag: "li", attrs: { class: "has-submenu" }, children: [{ tag: "a", attrs: { href: "/settings", config: m.route }, children: [{ tag: "i", attrs: { class: "md md-settings" } }, "Settings"] }] }, { tag: "li", attrs: { class: "has-submenu" }, children: [{ tag: "a", attrs: { href: "/scanner", config: m.route }, children: [{ tag: "i", attrs: { class: "md md-border-outer" } }, "Scan code"] }] }] }] }] }] }] };
			}
		};

		/*
  <li class="dropdown hidden-xs">
      <a href="#" data-target="#" class="dropdown-toggle waves-effect waves-light"
         data-toggle="dropdown" aria-expanded="true">
          <i class="md md-notifications"></i> <span
              class="badge badge-xs badge-pink">3</span>
      </a>
      <ul class="dropdown-menu dropdown-menu-lg">
          <li class="text-center notifi-title">Notification</li>
          <li class="list-group nicescroll notification-list">
              <a href="javascript:void(0);" class="list-group-item">
                  <div class="media">
                      <div class="pull-left p-r-10">
                          <em class="fa fa-diamond noti-primary"></em>
                      </div>
                      <div class="media-body">
                          <h5 class="media-heading">Lorem</h5>
                          <p class="m-0">
                              <small>ipsum</small>
                          </p>
                      </div>
                  </div>
              </a>
          </li>
  
          <li>
              <a href="javascript:void(0);" class=" text-right">
                  <small><b>See all notifications</b></small>
              </a>
          </li>
  
      </ul>
  </li>*/
	}, { "../models/Auth.js": 6 }], 4: [function (require, module, exports) {
		var conf = {
			master_key: 'GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA',
			create_acc_seed: 'SCD2AXMPMK2FYCDYSP6RMAHQ7J2W3XSFHFNVTXM2ACVT3OHD45NGQXSG',
			horizon_host: 'http://stellar.attic.pw:8000',
			wallet_host: 'http://keys.smartmoney.com.ua/',
			invoice_host: 'http://invoice.smartmoney.com.ua',
			invoice_add_url: '/api/invoice/add',
			invoice_get_url: '/api/invoice/get'
		};

		conf.horizon = new StellarSdk.Server(conf.horizon_host);

		var Config = module.exports = conf;
	}, {}], 5: [function (require, module, exports) {
		// Loading spinner
		m.onLoadingStart = function () {
			document.getElementById('spinner').style.display = 'block';
		};
		m.onLoadingEnd = function () {
			document.getElementById('spinner').style.display = 'none';
		};

		// Routing
		m.route.mode = 'hash';
		m.route(document.getElementById('app'), "/", {
			"/": require('./pages/Login.js'),
			"/home": require('./pages/Home.js'),
			"/logout": require('./pages/Logout.js'),
			"/invoice": require('./pages/Invoice.js'),
			"/sign": require('./pages/Sign.js'),
			"/transfer": require('./pages/Transfer.js'),
			"/settings": require('./pages/Settings.js'),
			"/scanner": require('./pages/Scanner.js')
		});

		var app = {
			// Application Constructor
			initialize: function initialize() {
				this.bindEvents();
			},
			// Bind Event Listeners
			//
			// Bind any events that are required on startup. Common events are:
			// `load`, `deviceready`, `offline`, and `online`.
			bindEvents: function bindEvents() {
				document.addEventListener('deviceready', this.onDeviceReady, false);
				document.getElementById('scan').addEventListener('click', this.scan, false);
				document.getElementById('encode').addEventListener('click', this.encode, false);
			},

			// deviceready Event Handler
			//
			// The scope of `this` is the event. In order to call the `receivedEvent`
			// function, we must explicity call `app.receivedEvent(...);`
			onDeviceReady: function onDeviceReady() {
				app.receivedEvent('deviceready');
			},

			// Update DOM on a Received Event
			receivedEvent: function receivedEvent(id) {
				var parentElement = document.getElementById(id);
				var listeningElement = parentElement.querySelector('.listening');
				var receivedElement = parentElement.querySelector('.received');

				listeningElement.setAttribute('style', 'display:none;');
				receivedElement.setAttribute('style', 'display:block;');

				console.log('Received Event: ' + id);
			},

			scan: function scan() {
				console.log('scanning');

				var scanner = cordova.require("cordova/plugin/BarcodeScanner");

				scanner.scan(function (result) {

					alert("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);

					console.log("Scanner result: \n" + "text: " + result.text + "\n" + "format: " + result.format + "\n" + "cancelled: " + result.cancelled + "\n");
					document.getElementById("info").innerHTML = result.text;
					console.log(result);
					/*
      if (args.format == "QR_CODE") {
      window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
      }
      */
				}, function (error) {
					console.log("Scanning failed: ", error);
				});
			},

			encode: function encode() {
				var scanner = cordova.require("cordova/plugin/BarcodeScanner");

				scanner.encode(scanner.Encode.TEXT_TYPE, "http://www.nhl.com", function (success) {
					alert("encode success: " + success);
				}, function (fail) {
					alert("encoding failed: " + fail);
				});
			}

		};
	}, { "./pages/Home.js": 7, "./pages/Invoice.js": 8, "./pages/Login.js": 9, "./pages/Logout.js": 10, "./pages/Scanner.js": 11, "./pages/Settings.js": 12, "./pages/Sign.js": 13, "./pages/Transfer.js": 14 }], 6: [function (require, module, exports) {
		var Conf = require('../config/Config.js');

		var Auth = module.exports = {
			keypair: m.prop(false),

			type: m.prop(false),

			username: m.prop(false),

			exists: m.prop(false),

			balances: m.prop([]),

			payments: m.prop([]),

			invoices: m.prop([]),

			updateBalances: function updateBalances(response) {
				var balances = [];
				Object.keys(response).map(function (index) {
					if (response[index].asset_type != 'native') {
						balances.push({
							balance: response[index].balance,
							asset: response[index].asset_code
						});
					}
				});

				m.startComputation();
				Auth.balances(balances);
				m.endComputation();
			},

			login: function login(_login, password) {
				return StellarWallet.getWallet({
					server: Conf.wallet_host + '/v2',
					username: _login,
					password: password
				}).then(function (wallet) {
					Auth.keypair(StellarSdk.Keypair.fromSeed(wallet.getKeychainData()));
					Auth.username(wallet.username);
					return Auth.loadAccount();
				}).then(function () {
					// TODO: show older transactions (add pagination)
					return Conf.horizon.payments().forAccount(Auth.keypair().accountId()).order('desc').limit(25).call();
				}).then(function (result) {
					Conf.horizon.payments().forAccount(Auth.keypair().accountId()).cursor('now').stream({
						onmessage: function onmessage(message) {
							var result = message.data ? JSON.parse(message.data) : message;
							m.startComputation();
							Auth.payments().unshift(result);
							m.endComputation();
						},
						onerror: function onerror(error) {}
					});

					m.startComputation();
					Auth.payments(result.records);
					m.endComputation();
				}).catch(function (err) {
					throw err;
				});
			},

			registration: function registration(login, password) {
				var accountKeypair = StellarSdk.Keypair.random();
				var walletUser = StellarSdk.Keypair.fromSeed(Conf.create_acc_seed);
				return StellarWallet.createWallet({
					server: Conf.wallet_host + '/v2',
					username: login,
					password: password,
					accountId: accountKeypair.accountId(),
					publicKey: accountKeypair.rawPublicKey().toString('base64'),
					keychainData: accountKeypair.seed(),
					mainData: 'mainData',
					kdfParams: {
						algorithm: 'scrypt',
						bits: 256,
						n: Math.pow(2, 11),
						r: 8,
						p: 1
					}
				}).then(function () {
					return Conf.horizon.loadAccount(walletUser.accountId());
				}).then(function (source) {
					var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.createAccount({
						destination: accountKeypair.accountId(),
						accountType: StellarSdk.xdr.AccountType.accountAnonymousUser().value
					})).build();

					tx.sign(walletUser);

					return Conf.horizon.submitTransaction(tx);
				}).then(function () {
					var sequence = '0';
					var anonymousAccount = new StellarSdk.Account(accountKeypair.accountId(), sequence);

					var tx = new StellarSdk.TransactionBuilder(anonymousAccount).addOperation(StellarSdk.Operation.changeTrust({
						asset: new StellarSdk.Asset('EUAH', Conf.master_key)
					}))
					// .addOperation(
					// StellarSdk.Operation.changeTrust({
					//         asset: new StellarSdk.Asset('DUAH', Conf.master_key)
					//     })
					// )
					.build();

					tx.sign(accountKeypair);
					return Conf.horizon.submitTransaction(tx);
				});
			},
			loadAccount: function loadAccount() {
				var ctrl = this;

				if (!Auth.keypair()) {
					return this.logout();
				}

				return Conf.horizon.accounts().accountId(Auth.keypair().accountId()).call().then(function (source) {
					Auth.exists(true);
					Auth.type(source.type);

					Conf.horizon.accounts().accountId(Auth.keypair().accountId()).cursor('now').stream({
						onmessage: function onmessage(source) {
							if (source.balances) {
								ctrl.updateBalances(source.balances);
							}
						},
						onerror: function onerror(error) {}
					});

					ctrl.updateBalances(source.balances);
				});
			},
			logout: function logout() {
				window.location.reload();
			},
			updateAdvData: function updateAdvData(email, phone) {
				console.log(Auth.username());
				return StellarWallet.updateAdvParams({
					server: Conf.wallet_host + '/v2',
					username: Auth.username(),
					email: email,
					phone: phone,
					accountId: Auth.keypair().accountId(),
					secretKey: Auth.keypair().seed()
				});
			}
		};
	}, { "../config/Config.js": 4 }], 7: [function (require, module, exports) {
		var Conf = require('../config/Config.js');
		var Navbar = require('../components/Navbar.js');
		var Footer = require('../components/Footer.js');
		var Auth = require('../models/Auth.js');

		var Home = module.exports = {
			controller: function controller() {
				var ctrl = this;

				if (!Auth.exists()) {
					return m.route('/');
				}

				this.navbar = new Navbar.controller();

				this.invoceAssetExist = m.prop(false);

				this.error = m.prop('');

				this.showInvoiceGetForm = m.prop(false);

				this.getInvoiceFormFields = m.prop({
					asset: {
						data: '',
						hname: 'Asset:'
					},
					amount: {
						data: '',
						hname: 'Amount:'
					},
					code: {
						data: '',
						hname: 'Code:'
					},
					payer: {
						data: '',
						hname: 'Payer:'
					},
					account: {
						data: '',
						hname: 'To account:'
					}
				});

				this.ShowGetForm = function () {
					this.showInvoiceGetForm = m.prop(true);
				};

				this.HideGetForm = function () {
					this.showInvoiceGetForm = m.prop(false);
				}.bind(this);

				this.getInvoice = function (e) {
					e.preventDefault();

					this.error('');
					this.showInvoiceGetForm = m.prop(false);
					ctrl.invoceAssetExist = m.prop(false);

					m.startComputation();
					m.onLoadingStart();

					var code = e.target.code.value;

					if (code <= 0 || !code) {
						ctrl.error(m(".alert.alert-danger.animated.fadeInUp", 'Bad code. Check value!'));
						m.onLoadingEnd();
						m.endComputation();
						return;
					}

					var formData = new FormData();

					formData.append("id", code);
					formData.append("account", Auth.keypair().accountId());

					try {

						var xhr = new XMLHttpRequest();
						xhr.open("POST", Conf.invoice_host + Conf.invoice_get_url, false); // false for synchronous request
						xhr.send(formData);
						response = JSON.parse(xhr.responseText);
						if (response.error) {
							switch (response.error) {
								case 'Invalid id':
									console.log('error: ' + response.error);
									$.Notification.notify('error', 'top center', 'Error', 'Invalid invoice code!');
									break;
								case 'no invoice':
									console.log('error: ' + response.error);
									$.Notification.notify('error', 'top center', 'Error', 'Invalid invoice code!');
									break;
								case 'invoice already requested':
									console.log('error: ' + response.error);
									$.Notification.notify('error', 'top center', 'Error', 'Invoice already requested');
									break;
								default:
									$.Notification.notify('error', 'top center', 'Error', 'Stellar error');
									console.log('Can not get invoice!');
									console.log(response);
							}
						} else {

							Auth.balances().map(function (b) {

								if (b.asset == response.asset) {
									ctrl.invoceAssetExist(m.prop(true));
								}
							});

							ctrl.ShowGetForm();

							this.getInvoiceFormFields()['code'].data = response._id;
							this.getInvoiceFormFields()['asset'].data = response.asset;
							this.getInvoiceFormFields()['amount'].data = response.amount / 100;
							this.getInvoiceFormFields()['payer'].data = response.payer;
							this.getInvoiceFormFields()['account'].data = response.account;
						}
					} catch (e) {
						$.Notification.notify('error', 'top center', 'Error', 'Stellar error');
						console.log('Can not send data to invoice server!');
						console.log(e);
					}

					m.onLoadingEnd();
					m.endComputation();
				};
				ctrl.getInvoice.bind(ctrl);
			},

			view: function view(ctrl) {
				return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-md-9" }, children: [{ tag: "h4", attrs: { class: "page-title" }, children: ["Welcome, ", Auth.username(), "!"] }, { tag: "p", attrs: { class: "account_overflow" }, children: ["Account id: ", Auth.keypair().accountId()] }] }, { tag: "div", attrs: { class: "col-md-3" }, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: ["Account info"] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table m-0" }, children: [{ tag: "tbody", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: ["Type"] }, { tag: "td", attrs: {}, children: [Auth.type()] }] }, { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: ["Balance:"] }, { tag: "td", attrs: {}, children: [Auth.balances().map(function (b) {
															return parseFloat(b.balance).toFixed(2) + " " + b.asset;
														})] }] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h4", attrs: { class: "text-dark header-title m-t-0" }, children: ["Account Transactions"] }, { tag: "p", attrs: { class: "text-muted m-b-25 font-13" }, children: ["Overview of recent transactions."] }, { tag: "div", attrs: { class: "table-responsive" }, children: [{ tag: "table", attrs: { class: "table" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: ["Account id"] }, { tag: "th", attrs: {}, children: ["Amount"] }, { tag: "th", attrs: {}, children: ["Type"] }] }] }, { tag: "tbody", attrs: {}, children: [Auth.payments().map(function (payment) {
											return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "span", attrs: { class: "hidden-xs" }, children: [payment.to == Auth.keypair().accountId() ? payment.from : payment.to] }, { tag: "span", attrs: { class: "visible-xs" }, children: [payment.to == Auth.keypair().accountId() ? payment.from.substr(0, 5) : payment.to.substr(0, 5), "..."] }] }, { tag: "td", attrs: {}, children: [parseFloat(payment.amount).toFixed(2), "  ", payment.asset_code] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { class: payment.to == Auth.keypair().accountId() ? 'label label-success' : 'label label-danger' }, children: [payment.to == Auth.keypair().accountId() ? 'Debit' : 'Credit'] }] }] };
										})] }] }] }] }] }] }, m.component(Footer)];
			}
		};
	}, { "../components/Footer.js": 2, "../components/Navbar.js": 3, "../config/Config.js": 4, "../models/Auth.js": 6 }], 8: [function (require, module, exports) {
		var Qr = require('../../node_modules/qrcode-npm/qrcode');
		var Conf = require('../config/Config.js');
		var Navbar = require('../components/Navbar.js');
		var Auth = require('../models/Auth.js');

		var Invoice = module.exports = {

			controller: function controller() {
				var ctrl = this;

				this.invoiceCode = m.prop(false);
				this.qr = m.prop(false);

				if (!Auth.exists()) {
					return m.route('/');
				}

				//create invoice function
				this.createInvoice = function (e) {
					e.preventDefault();

					var amount = parseFloat(e.target.amount.value) * 100;
					var asset = e.target.asset.value;

					if (!amount || amount < 0) {
						$.Notification.notify('error', 'top center', 'Error', 'Bad amount. Check value!');
						return;
					}

					// TODO: check if asset is available in Auth.balances

					if (!asset) {
						$.Notification.notify('error', 'top center', 'Error', 'Asset is invalid!');
						return;
					}

					var formData = new FormData();

					formData.append("amount", amount);
					formData.append("asset", asset);
					formData.append("account", Auth.keypair().accountId());
					var jsonData = {
						"account": Auth.keypair().accountId(),
						"amount": amount,
						"asset": asset,
						"t": 1
					};

					var qr = Qr.qrcode(8, 'Q');
					qr.addData(JSON.stringify(jsonData));

					qr.make();
					var imgTag = qr.createImgTag(4);
					ctrl.qr(m.trust(imgTag));

					m.onLoadingStart();

					try {

						var xhr = new XMLHttpRequest();
						xhr.open("POST", Conf.invoice_host + Conf.invoice_add_url, false); // false for synchronous request
						xhr.send(formData);

						var response = JSON.parse(xhr.responseText);
						if (response.error) {
							switch (response.error) {
								case 'bad amount':
									$.Notification.notify('error', 'top center', 'Error', 'Bad amount. Check value!');
									break;
								default:
									$.Notification.notify('error', 'top center', 'Error', 'Network error');
									break;
							}

							m.onLoadingEnd();
							return;
						}
					} catch (e) {
						$.Notification.notify('error', 'top center', 'Error', 'Network error');
					}

					m.onLoadingEnd();

					m.startComputation();
					this.invoiceCode(response);
					m.endComputation();

					$.Notification.notify('success', 'top center', 'Success', 'Invoice Created');
				};

				this.newForm = function (e) {
					this.invoiceCode(false);
				};
			},

			view: function view(ctrl) {
				var code = ctrl.qr();
				return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "h2", attrs: {}, children: ["Transfer"] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-4" }, children: [!ctrl.invoiceCode() ? { tag: "div", attrs: { class: "panel panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: ["Create a new invoice"] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.createInvoice.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-4" }, children: [{ tag: "label", attrs: { for: "" }, children: ["Amount:"] }, { tag: "input", attrs: { class: "form-control", type: "text", required: "", id: "amount",
															placeholder: "0.00",
															name: "amount" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-4" }, children: [{ tag: "select", attrs: { name: "asset", class: "form-control" }, children: [Auth.balances().map(function (b) {
															return { tag: "option", attrs: {}, children: [b.asset] };
														})] }] }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light", type: "submit" }, children: ["Create"] }] }] }] }] }] } : { tag: "div", attrs: { class: "panel panel-border panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: ["Invoice code"] }] }, { tag: "div", attrs: { class: "panel-body text-center" }, children: [{ tag: "h2", attrs: {}, children: [ctrl.invoiceCode()] }, { tag: "i", attrs: {}, children: ["Copy this invoice code and share it with someone you need to get money from"] }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, code, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "button", attrs: { class: "btn btn-purple waves-effect w-md waves-light m-b-5", onclick: ctrl.newForm.bind(ctrl) }, children: ["Create new"] }] }] }] }] }] }] }];
			}
		};
	}, { "../../node_modules/qrcode-npm/qrcode": 1, "../components/Navbar.js": 3, "../config/Config.js": 4, "../models/Auth.js": 6 }], 9: [function (require, module, exports) {
		var Navbar = require('../components/Navbar.js');
		var Auth = require('../models/Auth.js');

		var Login = module.exports = {
			controller: function controller() {
				if (Auth.exists()) {
					return m.route('/home');
				}

				this.login = function (e) {
					var ctrl = this;

					e.preventDefault();
					m.onLoadingStart();

					Auth.login(e.target.login.value, e.target.password.value).then(function () {
						m.route('/home');
					}, function (err) {
						$.Notification.notify('error', 'top center', 'Error', 'Login/password combination is invalid');
					}).then(function () {
						m.onLoadingEnd();
					});
				};
			},

			view: function view(ctrl) {
				return { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "index.html", class: "logo logo-lg" }, children: [{ tag: "i", attrs: { class: "md md-equalizer" } }, " ", { tag: "span", attrs: {}, children: ["SmartMoney"] }, " "] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "", placeholder: "Username", name: "login", value: "valerchik666" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "", placeholder: "Password", name: "password", value: "123123" } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group text-right m-t-20" }, children: [{ tag: "div", attrs: { class: "col-lg-5 col-xs-6 text-left" }, children: [{ tag: "a", attrs: { href: "/sign", config: m.route, style: "margin-top: 8px;display: block;" }, children: ["Create an account"] }] }, { tag: "div", attrs: { class: "col-lg-7 col-xs-6" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light", type: "submit" }, children: ["Log In"] }] }] }] }] };
			}
		};
	}, { "../components/Navbar.js": 3, "../models/Auth.js": 6 }], 10: [function (require, module, exports) {
		var Auth = require('../models/Auth.js');

		var Logout = module.exports = {
			controller: function controller() {
				Auth.logout();
				m.route('/');
			},

			view: function view(ctrl) {}
		};
	}, { "../models/Auth.js": 6 }], 11: [function (require, module, exports) {
		var Conf = require('../config/Config.js');
		var Navbar = require('../components/Navbar.js');
		var Auth = require('../models/Auth.js');

		var Scanner = module.exports = {

			controller: function controller() {
				var ctrl = this;

				if (!Auth.exists()) {
					return m.route('/');
				}

				this.scanCode = function () {
					cordova.plugins.barcodeScanner.scan(function (result) {
						var params = JSON.parse(result.text);

						switch (parseInt(params.t)) {
							case 1:
								{
									var getString = '?account=' + params.account;
									getString += '&amount=' + params.amount;
									getString += '&asset=' + params.asset;
									return m.route('/transfer' + getString);
								}break;
							default:
								{
									$.Notification.notify('error', 'top center', 'Error', 'Unknown function number');
									return;
								}break;
						}
					}, function (error) {
						$.Notification.notify('error', 'top center', 'Error', 'Scanning failed: ' + error);
						return;
					}, {
						"preferFrontCamera": false, // iOS and Android
						"showFlipCameraButton": true, // iOS and Android
						"prompt": "Place a barcode inside the scan area", // supported on Android only
						"formats": "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
						"orientation": "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
					});
				};
			},

			view: function view(ctrl) {
				return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "h2", attrs: {}, children: ["Scan QR-Code"] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-primary" }, children: [{ tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light",
													onclick: ctrl.scanCode.bind(ctrl)
												}, children: ["Scan"] }] }] }] }] }] }] }] }];
			}
		};
	}, { "../components/Navbar.js": 3, "../config/Config.js": 4, "../models/Auth.js": 6 }], 12: [function (require, module, exports) {
		var Conf = require('../config/Config.js');
		var Navbar = require('../components/Navbar.js');
		var Auth = require('../models/Auth.js');

		var Settings = module.exports = {

			controller: function controller() {
				var ctrl = this;

				if (!Auth.exists()) {
					return m.route('/');
				}

				this.changePassword = function (e) {

					var oldPassword = parseFloat(e.target.oldPassword.value);
					var newPassword = parseFloat(e.target.newPassword.value);
					var newRePassword = parseFloat(e.target.newRePassword.value);

					e.preventDefault();
					this.clearPassForm(e);
					$.Notification.notify('success', 'top center', 'Success', 'Password changed');
				};

				this.changeAdditionalData = function (e) {

					var email = parseFloat(e.target.email.value);
					var phone = parseFloat(e.target.phone.value);
					e.preventDefault();
					Auth.updateAdvData(email, phone).then(function () {
						this.clearAddForm(e);
						$.Notification.notify('success', 'top center', 'Success', 'Additional data saved');
					}, function (err) {
						$.Notification.notify('error', 'top center', 'Error', 'Additional data saving error! ' + err);
					});
				};

				this.clearPassForm = function (e) {
					e.target.oldPassword.value = '';
					e.target.newPassword.value = '';
					e.target.newRePassword.value = '';
				};
				this.clearAddForm = function (e) {
					e.target.email.value = '';
					e.target.phone.value = '';
				};
			},

			view: function view(ctrl) {
				return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "h2", attrs: {}, children: ["Settings"] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: ["Change password"] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.changePassword.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: ["Old password:"] }, { tag: "input", attrs: { class: "form-control", type: "text", required: "", id: "oldPassword",
															name: "oldPassword" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: ["New password:"] }, { tag: "input", attrs: { class: "form-control", type: "text", required: "", id: "newPassword",
															name: "newPassword" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: ["New repassword:"] }, { tag: "input", attrs: { class: "form-control", type: "text", required: "", id: "newRePassword",
															name: "newRePassword" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light",
															type: "submit" }, children: ["Change"] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: ["Change additional data"] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.changeAdditionalData.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: ["Email:"] }, { tag: "input", attrs: { class: "form-control", type: "text", required: "", id: "email",
															name: "email" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: ["Phone:"] }, { tag: "input", attrs: { class: "form-control", type: "text", required: "", id: "phone",
															name: "phone" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light",
															type: "submit" }, children: ["Save"] }] }] }] }] }] }] }] }] }] }];
			}
		};
	}, { "../components/Navbar.js": 3, "../config/Config.js": 4, "../models/Auth.js": 6 }], 13: [function (require, module, exports) {
		var Qr = require('../../node_modules/qrcode-npm/qrcode');
		var Navbar = require('../components/Navbar.js');
		var Auth = require('../models/Auth.js');

		var Sign = module.exports = {
			controller: function controller() {
				if (Auth.exists()) {
					return m.route('/home');
				}

				this.qr = m.prop(false);

				this.signup = function (e) {
					e.preventDefault();

					var ctrl = this;

					m.onLoadingStart();

					if (!e.target.login.value || !e.target.password.value || !e.target.repassword.value) {
						$.Notification.notify('error', 'top center', 'Error', 'Please, fill all required fields');
						m.onLoadingEnd();
						return;
					}

					if (e.target.password.value.length < 6) {
						$.Notification.notify('error', 'top center', 'Error', 'Password should have 6 chars min');
						m.onLoadingEnd();
						return;
					}

					if (e.target.password.value != e.target.repassword.value) {
						$.Notification.notify('error', 'top center', 'Error', 'Passwords should match');
						m.onLoadingEnd();
						return;
					}

					m.startComputation();
					Auth.registration(e.target.login.value, e.target.password.value).then(function () {
						var qr = Qr.qrcode(4, 'M');
						qr.addData(e.target.password.value);
						qr.make();
						var imgTag = qr.createImgTag(4);
						ctrl.qr(m.trust(imgTag));
					}, function (err) {
						console.log(err);
						if (err.name) {
							switch (err.name) {
								case 'UsernameAlreadyTaken':
									$.Notification.notify('error', 'top center', 'Error', 'Login already used');
									break;
								default:
									$.Notification.notify('error', 'top center', 'Error', 'Service error. Please contact support');
									break;
							}
						} else {
							$.Notification.notify('error', 'top center', 'Error', 'Service error. Please contact support');
						}
					}).then(function () {
						m.onLoadingEnd();
						m.endComputation();
					});
				};
			},

			view: function view(ctrl) {
				if (ctrl.qr()) {
					var code = ctrl.qr();
					ctrl.qr(false);
					var img = code.substring(code.indexOf('="') + 2, code.lastIndexOf('=="') + 2);
					return { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel panel-color panel-success" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: ["Registration successful"] }, { tag: "p", attrs: { class: "panel-sub-title font-13 text-muted" }, children: ["Print this QR-code and keep it in secure place. This is the only possible way to recover your password!"] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [code, { tag: "br", attrs: {} }, { tag: "a", attrs: { href: img, download: "qr_password.gif" }, children: ["Save code"] }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "a", attrs: { href: "/login", config: m.route, class: "btn btn-success btn-custom waves-effect w-md waves-light m-b-5" }, children: ["Sign in"] }] }] }] }] }] };
				}

				return { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "index.html", class: "logo logo-lg" }, children: [{ tag: "i", attrs: { class: "md md-equalizer" } }, " ", { tag: "span", attrs: {}, children: ["SmartMoney"] }, " "] }] }, { tag: "h4", attrs: { class: "text-center" }, children: ["Sign up new account"] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.signup.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "required", placeholder: "Username", name: "login", pattern: "[A-Za-z0-9_-]{3,}", title: "Characters and numbers allowed" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required", placeholder: "Password", name: "password", pattern: ".{6,}", title: "6 characters minimum" } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required", placeholder: "Retype Password", name: "repassword", pattern: ".{6,}", title: "6 characters minimum" } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group text-right m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-5 text-right" }, children: [{ tag: "a", attrs: { href: "/login", config: m.route, style: "margin-top: 8px;display: block;" }, children: ["Already registered?"] }] }, { tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light" }, children: ["Sign up"] }] }] }] }] };
			}
		};
	}, { "../../node_modules/qrcode-npm/qrcode": 1, "../components/Navbar.js": 3, "../models/Auth.js": 6 }], 14: [function (require, module, exports) {
		var Conf = require('../config/Config.js');
		var Navbar = require('../components/Navbar.js');
		var Auth = require('../models/Auth.js');

		var Invoice = module.exports = {

			controller: function controller() {
				var ctrl = this;

				this.infoAsset = m.route.param("asset") ? m.prop(m.route.param("asset")) : m.prop('');
				this.infoAmount = m.route.param("amount") ? m.prop(m.route.param("amount") / 100) : m.prop('');
				this.infoAccount = m.route.param("account") ? m.prop(m.route.param("account")) : m.prop('');

				if (!Auth.exists()) {
					return m.route('/');
				}

				this.getInvoice = function (e) {
					e.preventDefault();

					var code = e.target.code.value ? e.target.code.value.toString() : null;
					if (!code || code.length != 6) {
						$.Notification.notify('error', 'top center', 'Error', 'Invalid invoice code');
						return;
					}

					var formData = new FormData();
					formData.append("id", code);
					formData.append("account", Auth.keypair().accountId());

					m.onLoadingStart();

					try {
						var xhr = new XMLHttpRequest();
						xhr.open("POST", Conf.invoice_host + Conf.invoice_get_url, false); // false for synchronous request
						xhr.send(formData);
						var response = JSON.parse(xhr.responseText);
						if (response.error) {
							switch (response.error) {
								case 'Invalid invoice id':
								case 'no invoice':
									$.Notification.notify('error', 'top center', 'Error', 'Invalid invoice code');
									break;
								case 'invoice already requested':
									$.Notification.notify('error', 'top center', 'Error', 'Invalid already requested');
									break;
								default:
									$.Notification.notify('error', 'top center', 'Error', 'Network error');
									break;
							}

							m.onLoadingEnd();
							return;
						}
					} catch (e) {
						$.Notification.notify('error', 'top center', 'Error', 'Network error');
					}

					m.onLoadingEnd();

					var allow_inv = false;
					Auth.balances().map(function (b) {
						if (b.asset == response.asset) {
							allow_inv = true;
						}
					});

					if (!allow_inv) {
						$.Notification.notify('error', 'top center', 'Error', 'Invalid invoice currency');
						return;
					}

					m.startComputation();
					this.infoAsset(response.asset); // TODO: add this to form
					this.infoAmount(response.amount / 100);
					this.infoAccount(response.account);
					m.endComputation();

					// Clear input data
					e.target.code.value = '';

					$.Notification.notify('success', 'top center', 'Success', 'Invoice requested');
				};

				this.processPayment = function (e) {
					e.preventDefault();

					if (!StellarSdk.Keypair.isValidPublicKey(e.target.account.value)) {
						$.Notification.notify('error', 'top center', 'Error', 'Account is invalid');
						return;
					}

					var amount = parseFloat(e.target.amount.value);
					if (!amount) {
						$.Notification.notify('error', 'top center', 'Error', 'Amount is invalid');
						return;
					}

					m.startComputation();
					m.onLoadingStart();

					Conf.horizon.loadAccount(Auth.keypair().accountId()).then(function (source) {
						var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.payment({
							destination: e.target.account.value,
							amount: amount.toString(),
							asset: new StellarSdk.Asset(e.target.asset.value, Conf.master_key)
						})).build();

						tx.sign(Auth.keypair());

						Conf.horizon.submitTransaction(tx).then(function () {
							$.Notification.notify('success', 'top center', 'Success', 'Transfer successful');
							ctrl.infoAsset('');
							ctrl.infoAmount('');
							ctrl.infoAccount('');

							m.onLoadingEnd();
							m.endComputation();
						}).catch(function (err) {
							$.Notification.notify('error', 'top center', 'Error', 'Cannot make transfer');
							console.log(err);
						}).then(function () {
							ctrl.infoAsset('');
							ctrl.infoAmount('');
							ctrl.infoAccount('');

							m.onLoadingEnd();
							m.endComputation();
						});
					});
				};
			},

			view: function view(ctrl) {
				return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "h2", attrs: {}, children: ["Transfer"] }, { tag: "form", attrs: { class: "col-sm-4", onsubmit: ctrl.processPayment.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "panel panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: ["Transfer money"] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: ["Account ID"] }, { tag: "input", attrs: { name: "account", required: "required", oninput: m.withAttr("value", ctrl.infoAccount), pattern: ".{56}", title: "Account ID should have 56 symbols", class: "form-control", value: ctrl.infoAccount() } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: ["Amount"] }, { tag: "input", attrs: { name: "amount", required: "required", oninput: m.withAttr("value", ctrl.infoAmount), class: "form-control", value: ctrl.infoAmount() } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: ["Asset"] }, { tag: "select", attrs: { name: "asset", required: "required", class: "form-control" }, children: [Auth.balances().map(function (b) {
													return { tag: "option", attrs: { value: b.asset }, children: [b.asset] };
												})] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "button", attrs: { class: "btn btn-primary" }, children: ["Transfer"] }] }] }] }] }, { tag: "form", attrs: { class: "col-sm-4", onsubmit: ctrl.getInvoice.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "panel panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: ["Request invoice"] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: ["Invoice code"] }, { tag: "input", attrs: { type: "text", name: "code", required: "required", class: "form-control" } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "button", attrs: { class: "btn btn-primary" }, children: ["Request"] }] }] }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }];
			}
		};
	}, { "../components/Navbar.js": 3, "../config/Config.js": 4, "../models/Auth.js": 6 }] }, {}, [5]);