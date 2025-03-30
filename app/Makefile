protoc-gen-proto-ts:
	protoc --plugin=node_modules/.bin/protoc-gen-ts_proto \
  	-I=proto \
    --ts_proto_out=libs/common/src/grpc/node\
    --ts_proto_opt=nestJs=true \
    --ts_proto_opt=fileSuffix=.pb \
		proto/**/*.proto

