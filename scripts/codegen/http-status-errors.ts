/** HTTP 4xx and 5xx status codes used to generate Telegram API error types. */
export type HttpStatusError = {
	readonly tag: string;
	readonly errorCode: number;
	readonly name: string;
	readonly when?: string;
};

export const HTTP_STATUS_ERRORS: readonly HttpStatusError[] = [
	// 4xx Client Error
	{ tag: "BadRequest", errorCode: 400, name: "Bad Request" },
	{
		tag: "Unauthorized",
		errorCode: 401,
		name: "Unauthorized",
		when: "Token has bot id:hash form but the secret is invalid",
	},
	{ tag: "PaymentRequired", errorCode: 402, name: "Payment Required" },
	{ tag: "Forbidden", errorCode: 403, name: "Forbidden" },
	{ tag: "NotFound", errorCode: 404, name: "Not Found", when: "Token segment is empty or not in bot id:hash form" },
	{ tag: "MethodNotAllowed", errorCode: 405, name: "Method Not Allowed" },
	{ tag: "NotAcceptable", errorCode: 406, name: "Not Acceptable" },
	{ tag: "ProxyAuthenticationRequired", errorCode: 407, name: "Proxy Authentication Required" },
	{ tag: "RequestTimeout", errorCode: 408, name: "Request Timeout" },
	{ tag: "Conflict", errorCode: 409, name: "Conflict" },
	{ tag: "Gone", errorCode: 410, name: "Gone" },
	{ tag: "LengthRequired", errorCode: 411, name: "Length Required" },
	{ tag: "PreconditionFailed", errorCode: 412, name: "Precondition Failed" },
	{ tag: "PayloadTooLarge", errorCode: 413, name: "Payload Too Large" },
	{ tag: "UriTooLong", errorCode: 414, name: "URI Too Long" },
	{ tag: "UnsupportedMediaType", errorCode: 415, name: "Unsupported Media Type" },
	{ tag: "RangeNotSatisfiable", errorCode: 416, name: "Range Not Satisfiable" },
	{ tag: "ExpectationFailed", errorCode: 417, name: "Expectation Failed" },
	{ tag: "ImATeapot", errorCode: 418, name: "I'm a teapot" },
	{ tag: "MisdirectedRequest", errorCode: 421, name: "Misdirected Request" },
	{ tag: "UnprocessableContent", errorCode: 422, name: "Unprocessable Content" },
	{ tag: "Locked", errorCode: 423, name: "Locked" },
	{ tag: "FailedDependency", errorCode: 424, name: "Failed Dependency" },
	{ tag: "TooEarly", errorCode: 425, name: "Too Early" },
	{ tag: "UpgradeRequired", errorCode: 426, name: "Upgrade Required" },
	{ tag: "PreconditionRequired", errorCode: 428, name: "Precondition Required" },
	{ tag: "TooManyRequests", errorCode: 429, name: "Too Many Requests" },
	{ tag: "RequestHeaderFieldsTooLarge", errorCode: 431, name: "Request Header Fields Too Large" },
	{ tag: "UnavailableForLegalReasons", errorCode: 451, name: "Unavailable For Legal Reasons" },
	// 5xx Server Error
	{ tag: "InternalServerError", errorCode: 500, name: "Internal Server Error" },
	{ tag: "NotImplemented", errorCode: 501, name: "Not Implemented" },
	{ tag: "BadGateway", errorCode: 502, name: "Bad Gateway" },
	{ tag: "ServiceUnavailable", errorCode: 503, name: "Service Unavailable" },
	{ tag: "GatewayTimeout", errorCode: 504, name: "Gateway Timeout" },
	{ tag: "HttpVersionNotSupported", errorCode: 505, name: "HTTP Version Not Supported" },
	{ tag: "VariantAlsoNegotiates", errorCode: 506, name: "Variant Also Negotiates" },
	{ tag: "InsufficientStorage", errorCode: 507, name: "Insufficient Storage" },
	{ tag: "LoopDetected", errorCode: 508, name: "Loop Detected" },
	{ tag: "NotExtended", errorCode: 510, name: "Not Extended" },
	{ tag: "NetworkAuthenticationRequired", errorCode: 511, name: "Network Authentication Required" },
] as const;

export const HTTP_STATUS_ERRORS_BY_TAG = new Map(HTTP_STATUS_ERRORS.map(error => [error.tag, error] as const));

export const HTTP_STATUS_ERRORS_BY_CODE = new Map(HTTP_STATUS_ERRORS.map(error => [error.errorCode, error] as const));
