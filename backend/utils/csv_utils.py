import csv
from io import StringIO

def detect_delimiter(sample):
    """
    Detect the delimiter used in the CSV file
    """
    for delimiter in [',', ';', '\t']:
        try:
            reader = csv.DictReader(StringIO(sample.decode('utf-8')), delimiter=delimiter)
            if reader.fieldnames and any('asset' in field.lower() or 'description' in field.lower() for field in reader.fieldnames):
                return delimiter
        except Exception:
            continue
    return None

def to_float(val):
    """
    Convert string to float, handling European comma decimals and empty values
    """
    if val is None or val == '':
        return None
    if isinstance(val, str):
        val = val.strip().replace(",", ".")  # handle European comma decimals
        try:
            return float(val)
        except ValueError:
            return None
    return float(val)

def to_int(val):
    """
    Convert string to integer, handling empty values
    """
    if val is None or val == '':
        return None
    if isinstance(val, str):
        val = val.strip()
        try:
            return int(float(val))  # Handle cases like "15.0"
        except ValueError:
            return None
    return int(val)

def clean_fieldnames(fieldnames):
    """
    Clean fieldnames (remove BOM and whitespace)
    """
    return [field.strip().lstrip('\ufeff') for field in fieldnames]

def get_case_insensitive_value(row, field_name):
    """
    Get value from row with case-insensitive field matching
    """
    for key, value in row.items():
        if field_name.lower() in key.lower():
            return value
    return None