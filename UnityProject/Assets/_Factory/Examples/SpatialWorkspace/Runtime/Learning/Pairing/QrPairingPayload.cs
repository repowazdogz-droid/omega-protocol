using System;
using System.Text.RegularExpressions;
using UnityEngine;

namespace Omega.SpatialWorkspace.Learning
{
    /// <summary>
    /// QrPairingPayload: Parses QR text into baseUrl and pairCode.
    /// Handles multiple formats: full URL, API URL, raw code.
    /// </summary>
    public static class QrPairingPayload
    {
        /// <summary>
        /// Parses QR text and extracts baseUrl and pairCode.
        /// </summary>
        public static ParseResult Parse(string qrText)
        {
            if (string.IsNullOrEmpty(qrText))
            {
                return new ParseResult { Success = false, Error = "QR text is empty" };
            }

            // Sanitize: uppercase, strip spaces
            string sanitized = qrText.Trim().ToUpper().Replace(" ", "");

            // Try to extract pair code from various formats
            string pairCode = null;
            string baseUrl = null;

            // Format 1: Full URL with query param: https://host/pair?code=K7D4P9
            var match1 = Regex.Match(sanitized, @"HTTPS?://([^/]+)/PAIR\?CODE=([A-Z0-9]{6})", RegexOptions.IgnoreCase);
            if (match1.Success)
            {
                baseUrl = $"http://{match1.Groups[1].Value}";
                pairCode = match1.Groups[2].Value;
            }

            // Format 2: API URL: https://host/api/learning/pair/K7D4P9
            var match2 = Regex.Match(sanitized, @"HTTPS?://([^/]+)/API/LEARNING/PAIR/([A-Z0-9]{6})", RegexOptions.IgnoreCase);
            if (match2.Success)
            {
                baseUrl = $"http://{match2.Groups[1].Value}";
                pairCode = match2.Groups[2].Value;
            }

            // Format 3: Raw code (6 alphanumeric characters)
            if (pairCode == null)
            {
                var codeMatch = Regex.Match(sanitized, @"([A-Z0-9]{6})");
                if (codeMatch.Success)
                {
                    pairCode = codeMatch.Value;
                    // Use default host if not found in URL
                    baseUrl = null; // Will use PairingClient's default
                }
            }

            // Validate pair code
            if (string.IsNullOrEmpty(pairCode) || pairCode.Length != 6)
            {
                return new ParseResult
                {
                    Success = false,
                    Error = "Invalid pair code format. Expected 6 alphanumeric characters."
                };
            }

            // Validate characters (exclude confusing chars)
            if (!IsValidPairCode(pairCode))
            {
                return new ParseResult
                {
                    Success = false,
                    Error = "Pair code contains invalid characters."
                };
            }

            return new ParseResult
            {
                Success = true,
                PairCode = pairCode,
                BaseUrl = baseUrl
            };
        }

        /// <summary>
        /// Validates pair code (excludes confusing characters).
        /// </summary>
        private static bool IsValidPairCode(string code)
        {
            // Exclude: 0, O, I, 1, L (confusing)
            string validChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            foreach (char c in code)
            {
                if (!validChars.Contains(c))
                {
                    return false;
                }
            }
            return true;
        }
    }

    /// <summary>
    /// ParseResult: Result of QR parsing.
    /// </summary>
    public class ParseResult
    {
        public bool Success { get; set; }
        public string PairCode { get; set; }
        public string BaseUrl { get; set; }
        public string Error { get; set; }
    }
}











