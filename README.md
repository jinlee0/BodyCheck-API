# BodyCheck-API
본 API는 JWT를 통해 사용자를 인증합니다.   
JWT를 발급받은 후 쿠키 혹은 웹스토리지에 보관하며, 요청 헤더의 "bodycheck-access-token"에 토큰을 담아 요청을 보내야 합니다.   
클라이언트에서는 JWT의 유효기간을 확인하고 재발급하는 기능을 구현하여야 합니다.   
API에서 발급하는 토큰의 유효기간은 1시간 입니다.   
JWT인증이므로 로그아웃 기능 구현을 위해서는 클라이언트에서 쿠키 혹은 웹스토리지에 보관된 토큰을 삭제하여야 합니다.   
***
# Return Format
```
{
  "success": true,
  "message": "msg",
  "data": data
}
```
[DELETE], [PUT]의 경우 affectedRows field를 포함합니다.
***
# Models

users/   
```
* model: User   
* fields: id, email, password   
* relationship:   
 * User -> Exercise   
```

exercises/   
```
* model: Exercise   
* fields: id, name, UserId
* relationship:   
 * User -> Exercise   
 * Exercise -> Variable   
```

variables/
```
* model: Variable
* fields: id, name, record, ExerciseId
* relationship:
 * VariableType -> Variable
 * Variable -> Record
```
variableTypes/
```
* model: VariableType
* fields: id, name
* relationship:
 * VariableType -> Variable
```
records/
```
* model: Record
* fields: id, record, DateRecordId, VariableId
* relationship:
 * Variable -> Record
 * DateRecord -> Record
```
dateRecords/
```
* model: DateRecord
* fields: id, date, startTime, endTime, memo
* relationship:
 * DateRecord -> Record
 ```
