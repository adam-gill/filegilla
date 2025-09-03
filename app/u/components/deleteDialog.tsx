// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { deleteShareItem } from "@/app/u/actions";
// import { FolderItem } from "@/app/u/types";
// import { toast } from "@/hooks/use-toast";

// interface DeleteDialogProps {
//   item: FolderItem;
//   itemShareName?: string;
//   type: "file-folder" | "public-file";
//   isDeleteOpen: boolean;
//   setIsDeleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
// }

// export default function DeleteDialog({
//   item,
//   itemShareName,
//   type,
//   isDeleteOpen,
//   setIsDeleteOpen,
// }: DeleteDialogProps) {
//   const getAlertValues = (): { title: string; description: string } => {
//     if (type === "file-folder") {
//       const description =
//         item.type === "folder"
//           ? `this will permanently delete '${item.name}' and all of its contents`
//           : `this will permanently delete '${item.name}'`;

//       return { title: `delete '${item.name}'?`, description: description };
//     } else {
//       return {
//         title: `delete '${item.name}'?`,
//         description: `this will delete '${item.name}' from public files`,
//       };
//     }
//   };

//   const { title, description } = getAlertValues();

//   const handleItemDeletion = async () => {
//     if (type === "public-file" && itemShareName) {
//       try {
//         if (item.etag) {
//           const { success, message } = await deleteShareItem(
//             item.name,
//             itemShareName,
//             item.etag
//           );

//           if (success) {
//             toast({
//               title: "success!",
//               description: message,
//               variant: "good",
//             });
//           } else {
//             toast({
//               title: "error",
//               description: message,
//               variant: "destructive",
//             });
//           }
//         }
//       } catch (error) {
//         toast({
//           title: "error",
//           description: `unknown error deleting share: ${error}`,
//           variant: "destructive",
//         });
//       }
//     } else {

//     }

//     return "";
//   };

//   return (
//     <>
//       <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
//         <AlertDialogContent className="!bg-white shadow-2xl shadow-gray-600 text-gray-200">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-black text-2xl">
//               {title}
//             </AlertDialogTitle>
//             <AlertDialogDescription className="!text-gray-600 text-base">
//               {description}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-transparent cursor-pointer !text-black hover:!bg-blue-100 trans">
//               cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleItemDeletion}
//               className="focus-visible:!ring-neutral-900 focus-visible:!ring-2 text-base !bg-red-600/85  cursor-pointer !text-white hover:!bg-white hover:!border-black hover:!text-black trans disabled:!bg-gray-300 disabled:!text-gray-500 disabled:cursor-not-allowed"
//             >
//               delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
