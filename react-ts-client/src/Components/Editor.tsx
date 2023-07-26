import { Box, Icon, Text, Flex, Button, useToast } from '@chakra-ui/react';
import { useState, useContext } from 'react';
import JSONInput from 'react-json-editor-ajrm';
import { AiFillSave } from "react-icons/ai"
import AuthContext from '../Providers/Auth';

// REMOVED
// NOT IN USE
// JSON Editor

const SaveIcon = () => {
    return(
        <Icon fontSize="20" as={AiFillSave} />
    )
}

const localeEn = {
    format: "{reason} at line {line}",
    symbols: {
      colon: "colon", // 
      comma: "comma", // ,  ،  、
      semicolon: "semicolon", // ;
      slash: "slash", // /  relevant for comment syntax support
      backslash: "backslash", // \  relevant for escaping character
      brackets: {
        round: "round brackets", // ( )
        square: "square brackets", // [ ]
        curly: "curly brackets", // { }
        angle: "angle brackets", // < >
      },
      period: "period", // . Also known as full point, full stop, or dot
      quotes: {
        single: "single quote", // '
        double: "double quote", // "
        grave: "grave accent", // ` used on Javascript ES6 Syntax for String Templates
      },
      space: "space", //
      ampersand: "ampersand", // &
      asterisk: "asterisk", // *  relevant for some comment sytanx
      at: "at sign", // @  multiple uses in other coding languages including certain data types
      equals: "equals sign", // =
      hash: "hash", // #
      percent: "percent", // %
      plus: "plus", // +
      minus: "minus", // −
      dash: "dash", // −
      hyphen: "hyphen", // −
      tilde: "tilde", // ~
      underscore: "underscore", // _
      bar: "vertical bar", // |
    },
    types: {
      // ... Reference: https://en.wikipedia.org/wiki/List_of_data_structures
      key: "key",
      value: "value",
      number: "number",
      string: "string",
      primitive: "primitive",
      boolean: "boolean",
      character: "character",
      integer: "integer",
      array: "array",
      float: "float",
    },
    invalidToken: {
      tokenSequence: {
        prohibited: "'{firstToken}' token cannot be followed by '{secondToken}' token(s)",
        permitted: "'{firstToken}' token can only be followed by '{secondToken}' token(s)",
      },
      termSequence: {
        prohibited: "A {firstTerm} cannot be followed by a {secondTerm}",
        permitted: "A {firstTerm} can only be followed by a {secondTerm}",
      },
      double: "'{token}' token cannot be followed by another '{token}' token",
      useInstead: "'{badToken}' token is not accepted. Use '{goodToken}' instead",
      unexpected: "Unexpected '{token}' token found",
    },
    brace: {
      curly: {
        missingOpen: "Missing '{' open curly brace",
        missingClose: "Open '{' curly brace is missing closing '}' curly brace",
        cannotWrap: "'{token}' token cannot be wrapped in '{}' curly braces",
      },
      square: {
        missingOpen: "Missing '[' open square brace",
        missingClose: "Open '[' square brace is missing closing ']' square brace",
        cannotWrap: "'{token}' token cannot be wrapped in '[]' square braces",
      },
    },
    string: {
      missingOpen: "Missing/invalid opening string '{quote}' token",
      missingClose: "Missing/invalid closing string '{quote}' token",
      mustBeWrappedByQuotes: "Strings must be wrapped by quotes",
      nonAlphanumeric: "Non-alphanumeric token '{token}' is not allowed outside string notation",
      unexpectedKey: "Unexpected key found at string position",
    },
    key: {
      numberAndLetterMissingQuotes: "Key beginning with number and containing letters must be wrapped by quotes",
      spaceMissingQuotes: "Key containing space must be wrapped by quotes",
      unexpectedString: "Unexpected string found at key position",
    },
    noTrailingOrLeadingComma: "Trailing or leading commas in arrays and objects are not permitted",
  };
  
const dark_vscode_tribute = {
    default: "#D4D4D4",
    background: "#2A2E37",
    background_warning: "#1E1E1E",
    string: "#CE8453",
    number: "#B5CE9F",
    colon: "#49B8F7",
    keys: "#9CDCFE",
    keys_whiteSpace: "#AF74A5",
    primitive: "#6392C6",
  };
  
export const Editor = () => {

    const authCtx = useContext(AuthContext);
    // console.log(authCtx.configuration.config);

    const toast = useToast();

    const [json, setJson] = useState(authCtx.configuration.config);

    const handleJsonChange = (event: any) => {
        setJson(event.jsObject);
    };

    const handleSave = () => {
        var changedConfig = authCtx.configuration
        changedConfig.config = json
        authCtx.setCurrentConfig(changedConfig, authCtx.currentConfigID)
        fetch("http://localhost:4000/updateConfig/" + authCtx.currentConfigID + "/", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            {config: changedConfig, 
            authID: authCtx.authID}),
        }).then(response => {
          if(response.status === 200) {
            toast({
              title: "Configuration Updated!",
              position: "top",
              status: "success",
              duration: 3000,
            });
          }
          else{
            toast({
              title: "Unable to edit configuration",
              position: "top",
              status: "error",
              duration: 3000,
            });
          }
        })
    }
      
        return (
            <Box height="88vh" overflowX="hidden" overflowY="scroll">
             <Flex justifyContent={"space-between"} pr={"7vw"}> 
                <Text
                    fontSize={"3xl"}
                    py={4}
                    px={4}
                    fontWeight="bold"
                    >
                    Editor - {authCtx.configuration.name}
                </Text>
                <Button leftIcon={<SaveIcon />} my={4} mx={4} colorScheme='teal' variant='solid' size="lg" onClick={() => {handleSave()}}>
                    Save
                </Button>
            </Flex>
            <Box width={"85vw"} height={"200vh"} overflowY="scroll" fontSize={"24px"}>
                <JSONInput
                id="json-editor"
                colors={dark_vscode_tribute}
                locale={localeEn}
                height="100%"
                width="100%"
                waitAfterKeyPress={1500}
                onChange={handleJsonChange}
                placeholder={json}
                />
            </Box>
          </Box>
        );
      
};