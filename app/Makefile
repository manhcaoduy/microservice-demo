protoc-gen-proto-ts:
	protoc --plugin=node_modules/.bin/protoc-gen-ts_proto \
  	-I=proto \
    --ts_proto_out=libs/grpc/src/clients \
    --ts_proto_opt=nestJs=true \
    --ts_proto_opt=fileSuffix=.pb \
		proto/**/*.proto

