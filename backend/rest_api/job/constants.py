from types import MappingProxyType

JOB_ERROR_CATEGORIES = MappingProxyType(
    {
        "0": "Uncategorized",
        "1": "File and Storage Issues",
        "2": "Execution and Payload Failures",
        "3": "Network and Communication Errors",
        "4": "Job Termination and Kill Signals",
        "5": "Software and Environment Issues",
        "6": "Internal and Unknown Errors",
    }
)
