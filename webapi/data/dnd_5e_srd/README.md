# D&D 5e SRD Resource Retrieval System

This system provides a flexible way to retrieve D&D 5e SRD data using the base_datastore pattern. It supports three levels of input parameters and automatically caches API responses in the datastore.

## Features

- **Three-level parameter support**: database, table, and resource
- **Automatic caching**: API responses are stored in the datastore for future use
- **Fallback mechanism**: First checks datastore, then falls back to API
- **Flexible URL construction**: Automatically builds API URLs based on parameters
- **Base datastore integration**: Follows the established base_datastore pattern

## Usage

### Basic Function Call

```python
from data.dnd_5e_srd.resource import get_resource_data

# Get base index (all available resources)
base_data = get_resource_data()

# Get ability score data for Constitution
con_data = get_resource_data('ability-scores', 'con')

# Get ranger class multi-classing information
ranger_multiclass = get_resource_data('classes', 'ranger', 'multi-classing')

# Get hunter subclass features
hunter_features = get_resource_data('subclasses', 'hunter', 'features')
```

### Direct Class Usage

```python
from data.dnd_5e_srd.resource import Dnd5eResource

# Create a resource instance
hunter_features = Dnd5eResource('subclasses', 'hunter', 'features')

# Get the data
data = hunter_features.get_resource_data()

# Access properties
print(f"Database: {hunter_features.database}")
print(f"Table: {hunter_features.table}")
print(f"Resource: {hunter_features.resource}")
```

## Parameter Levels

### Level 1: Database
The top-level category (e.g., 'classes', 'subclasses', 'ability-scores', 'races', 'spells')

### Level 2: Table
The specific item within the database (e.g., 'ranger', 'hunter', 'con', 'elf', 'fireball')

### Level 3: Resource
The specific aspect or feature (e.g., 'multi-classing', 'features', 'index', 'spellcasting')

## API URL Construction

The system automatically constructs API URLs based on the parameters:

- `get_resource_data()` → `https://www.dnd5eapi.co/api/2014`
- `get_resource_data('ability-scores', 'con')` → `https://www.dnd5eapi.co/api/2014/ability-scores/con`
- `get_resource_data('classes', 'ranger', 'multi-classing')` → `https://www.dnd5eapi.co/api/2014/classes/ranger/multi-classing`
- `get_resource_data('subclasses', 'hunter', 'features')` → `https://www.dnd5eapi.co/api/2014/subclasses/hunter/features`

## Data Storage

All API responses are automatically stored in the datastore using the following structure:
- **Database**: `dnd-5e-srd-2014`
- **Table**: `resources`
- **Entity ID**: `{database}-{table}-{resource}`

For example, hunter subclass features would be stored with entity ID: `subclasses-hunter-features`

## Error Handling

The system gracefully handles:
- Network errors during API requests
- Invalid API responses
- Datastore storage failures
- Missing or malformed data

## Testing

Run the test script to verify the system works correctly:

```bash
cd webapi
python test_resource.py
```

## Dependencies

- `requests`: For making HTTP requests to the D&D 5e API
- `boto3`: For S3-based datastore operations
- `data.base_datastore`: For the base datastore pattern implementation

## Examples

### Getting Class Information
```python
# Get basic ranger class info
ranger = get_resource_data('classes', 'ranger')
print(f"Ranger hit die: d{ranger['hit_die']}")
print(f"Proficiencies: {ranger['proficiencies']}")
```

### Getting Subclass Features
```python
# Get hunter subclass features
features = get_resource_data('subclasses', 'hunter', 'features')
for feature in features['results']:
    print(f"- {feature['name']}")
```

### Getting Ability Score Details
```python
# Get Constitution ability score details
con = get_resource_data('ability-scores', 'con')
print(f"Constitution full name: {con['full_name']}")
print(f"Description: {con['desc'][0]}")
```

## Notes

- The system automatically handles the 'index' special case for each parameter level
- All data is cached in the datastore to reduce API calls
- The system follows RESTful URL construction principles
- Entity IDs are created by combining all three parameters with hyphens
