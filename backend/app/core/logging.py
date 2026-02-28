"""
Structured logging configuration with PII redaction.
Uses structlog for JSON-formatted log output.
"""
import logging
import re
import structlog


_EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
_PHONE_RE = re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b")


def _redact_pii(_logger, _method, event_dict):
    """Redact emails and phone numbers from log messages."""
    msg = event_dict.get("event", "")
    if isinstance(msg, str):
        msg = _EMAIL_RE.sub("[REDACTED_EMAIL]", msg)
        msg = _PHONE_RE.sub("[REDACTED_PHONE]", msg)
        event_dict["event"] = msg
    return event_dict


def setup_logging(log_level: str = "INFO"):
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            _redact_pii,
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    logging.basicConfig(format="%(message)s", level=getattr(logging, log_level))


def get_logger(name: str = __name__):
    return structlog.get_logger(name)
