#!/bin/bash
set -e

# Placeholder for account IDs - user should set these
MASTER_ACC="daic-dev-1770225642.testnet"
NEAR_BIN="/Users/daddy/.nvm/versions/node/v24.12.0/bin/near"

if [ "$1" ]; then
  MASTER_ACC=$1
fi

echo "Deploying to NEAR Testnet using account: $MASTER_ACC"

# Function to create sub-account if it doesn't exist
create_account() {
  local ACCOUNT_ID=$1
  echo "Processing $ACCOUNT_ID..."
  if ! $NEAR_BIN view-state $ACCOUNT_ID network-config testnet > /dev/null 2>&1; then
      echo "Creating account $ACCOUNT_ID..."
      $NEAR_BIN create-account $ACCOUNT_ID --masterAccount $MASTER_ACC --initialBalance 5
  else
      echo "Account $ACCOUNT_ID already exists."
  fi
}

# Create sub-accounts
create_account "dao.$MASTER_ACC"
create_account "provenance.$MASTER_ACC"
create_account "did.$MASTER_ACC"

# Deploy DAO
echo "Deploying DAO..."
$NEAR_BIN deploy $MASTER_ACC --wasmFile out/daic_dao.wasm --initFunction new --initArgs '{}'
# Ideal logic:
$NEAR_BIN deploy "dao.$MASTER_ACC" --wasmFile out/daic_dao.wasm --initFunction new --initArgs '{}'

# Deploy Provenance
echo "Deploying Provenance..."
$NEAR_BIN deploy "provenance.$MASTER_ACC" --wasmFile out/daic_provenance.wasm --initFunction new --initArgs '{}'

# Deploy DID Registry
echo "Deploying DID Registry..."
$NEAR_BIN deploy "did.$MASTER_ACC" --wasmFile out/daic_did_registry.wasm --initFunction new --initArgs '{}'

echo "Deployment complete!"
