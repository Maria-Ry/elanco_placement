class ValidationError(Exception):
    """
    Raised when input data from API or user payload is invalid.
    """
    pass


class ReportError(Exception):
    """
    Raised when parameters for reporting are invalid.
    """
    pass