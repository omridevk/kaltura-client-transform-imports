const t = require("@babel/types");

/**
 * To improve tree shaking and let webpack do his thing
 * and remove unused code by implicit import.
 * this babel transformer takes care of that.
 * replace imports like
 * import {EntryVendorTaskExportToCsvAction, KalturaEntryVendorTaskFilter} from "kaltura-typescript-client/api/types";
 * to
 * import {EntryVendorTaskExportToCsvAction} from "kaltura-typescript-client/api/types/EntryVendorTaskExportToCsvAction";
 * import {EntryVendorTaskExportToCsvAction} from "kaltura-typescript-client/api/types/KalturaEntryVendorTaskFilter";
 * @returns {{visitor: {ImportDeclaration: visitor.ImportDeclaration}}}
 */
module.exports = function () {
    return {
        visitor: {
            ImportDeclaration: function (path) {
                if (path.node.source.value !== "kaltura-typescript-client/api/types") {
                    return;
                }
                const transforms = [];
                const memberImports = path.node.specifiers.filter(
                    (specifier) => specifier.type === "ImportSpecifier"
                );
                const source = path.node.source.value;

                memberImports.forEach((memberImport) => {
                    const newImportSpecifier = t.importSpecifier(
                        t.identifier(memberImport.local.name),
                        t.identifier(memberImport.local.name)
                    );
                    transforms.push(
                        t.importDeclaration(
                            [newImportSpecifier],
                            t.stringLiteral(`${source}/${memberImport.local.name}`)
                        )
                    );
                });
                if (transforms.length < 1) {
                    return;
                }
                path.replaceWithMultiple(transforms);
            }
        }
    };
};
