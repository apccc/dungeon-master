#!/usr/bin/env python3
"""
Test script for the D&D 5e resource retrieval system.
Demonstrates the three levels of input parameters and API integration.
"""

from data.dnd_5e_srd.resource import get_resource_data, Dnd5eResource


def test_resource_retrieval():
    """Test various resource retrieval scenarios."""
    
    print("Testing D&D 5e Resource Retrieval System")
    print("=" * 50)
    
    # Test 1: Base index (no parameters)
    print("\n1. Testing base index retrieval:")
    print("   get_resource_data()")
    base_data = get_resource_data()
    print(f"   Retrieved {len(base_data)} top-level keys")
    if 'count' in base_data:
        print(f"   Available resources: {base_data['count']}")
    
    # Test 2: Two-level retrieval (database + table)
    print("\n2. Testing two-level retrieval:")
    print("   get_resource_data('ability-scores', 'con')")
    ability_data = get_resource_data('ability-scores', 'con')
    if ability_data:
        print(f"   Retrieved ability score data: {ability_data.get('name', 'Unknown')}")
        print(f"   Full name: {ability_data.get('full_name', 'N/A')}")
    
    # Test 3: Three-level retrieval (database + table + resource)
    print("\n3. Testing three-level retrieval:")
    print("   get_resource_data('subclasses', 'hunter', 'features')")
    features_data = get_resource_data('subclasses', 'hunter', 'features')
    if features_data:
        print(f"   Retrieved {features_data.get('count', 0)} hunter subclass features")
        if 'results' in features_data:
            print("   First few features:")
            for i, feature in enumerate(features_data['results'][:3]):
                print(f"     {i+1}. {feature.get('name', 'Unknown')}")
    
    # Test 4: Class information
    print("\n4. Testing class retrieval:")
    print("   get_resource_data('classes', 'ranger')")
    ranger_data = get_resource_data('classes', 'ranger')
    if ranger_data:
        print(f"   Retrieved ranger class data: {ranger_data.get('name', 'Unknown')}")
        print(f"   Hit die: d{ranger_data.get('hit_die', 'N/A')}")
    
    # Test 5: Multi-classing information
    print("\n6. Testing multi-classing retrieval:")
    print("   get_resource_data('classes', 'ranger', 'multi-classing')")
    multiclass_data = get_resource_data('classes', 'ranger', 'multi-classing')
    if multiclass_data:
        print(f"   Retrieved ranger multi-classing data")
        if 'prerequisites' in multiclass_data:
            print(f"   Prerequisites: {len(multiclass_data['prerequisites'])} requirements")
    
    print("\n" + "=" * 50)
    print("Testing completed!")


def test_direct_class_usage():
    """Test using the Dnd5eResource class directly."""
    
    print("\n\nTesting Direct Class Usage")
    print("=" * 50)
    
    # Create a resource instance for hunter subclass features
    hunter_features = Dnd5eResource('subclasses', 'hunter', 'features')
    
    print(f"Entity ID: {hunter_features.entity_id}")
    print(f"Database: {hunter_features.database}")
    print(f"Table: {hunter_features.table}")
    print(f"Resource: {hunter_features.resource}")
    
    # Get the data
    data = hunter_features.get_resource_data()
    if data:
        print(f"Retrieved {data.get('count', 0)} features")
    
    print("=" * 50)


if __name__ == "__main__":
    try:
        test_resource_retrieval()
        test_direct_class_usage()
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
