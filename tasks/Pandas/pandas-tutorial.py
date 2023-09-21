import pandas as pd

# Read the CSV files into DataFrames.
codes_df = pd.read_csv("src/country_codes.csv", encoding='latin1', delimiter=',')
bands_df = pd.read_csv("src/metal_bands_2017.csv", encoding='latin1', delimiter=',')
world_df = pd.read_csv("src/world_population.csv", encoding='latin1', delimiter=';')

# Clean column 'origin' by dropping rows with NaN values.
bands_df.dropna(subset=["origin"], inplace=True)

# Count the frequency of each origin and add it as a new column.
bands_df['frequency'] = bands_df['origin'].map(bands_df['origin'].value_counts())

# Drop irrelevant columns in the DataFrame.
bands_df.drop(['id', 'band_name', 'fans', 'formed', 'split', 'style'], axis=1, inplace=True)

# Sort and remove duplicates while keeping the first record.
bands_df.drop_duplicates(subset="origin", keep='first', inplace=True)

# Merge with the world population DataFrame.
output_df = bands_df.merge(world_df[['country', 'population']], left_on='origin', right_on='country')

# Calculate per capita frequency.
output_df['per_capita'] = output_df['frequency'] / output_df['population']

# Drop irrelevant columns in the DataFrame.
output_df.drop(['frequency', 'population', 'country'], axis=1, inplace=True)

# Merge with the country codes DataFrame.
output_df = output_df.merge(codes_df[['name', 'alpha-2']], left_on='origin', right_on='name')

# Drop irrelevant columns in the DataFrame.
output_df.drop(['name', 'origin'], axis=1, inplace=True)

# Export as a csv.
output_df.to_csv('data.csv', index=False, header=True)
